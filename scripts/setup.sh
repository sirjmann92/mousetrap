#!/bin/sh
set -eu

# Create the local Python environment and install the locked frontend
# dependencies required for development, linting, and tests.

SCRIPT_DIR="$(CDPATH='' cd -P "$(dirname "$0")" && pwd)"
REPO_ROOT="$(CDPATH='' cd -P "$SCRIPT_DIR/.." && pwd)"
VENV_DIR="$REPO_ROOT/.venv"
VENV_PYTHON="$VENV_DIR/bin/python"
VENV_PREK="$VENV_DIR/bin/prek"

cd "$REPO_ROOT"

# Reuse an existing environment. Otherwise, prefer the versioned interpreter
# from the documentation and fall back to python3 after checking its version.
if [ ! -x "$VENV_PYTHON" ]; then
  if command -v python3.13 >/dev/null 2>&1; then
    PYTHON="$(command -v python3.13)"
  elif command -v python3 >/dev/null 2>&1; then
    PYTHON="$(command -v python3)"
  else
    echo "Python 3.13 or newer was not found." >&2
    exit 1
  fi

  if ! "$PYTHON" -c 'import sys; raise SystemExit(sys.version_info < (3, 13))'; then
    echo "Python 3.13 or newer is required: $PYTHON" >&2
    exit 1
  fi
fi

if [ -x "$VENV_PYTHON" ] &&
  ! "$VENV_PYTHON" -c 'import sys; raise SystemExit(sys.version_info < (3, 13))'; then
  echo "The existing .venv uses Python older than 3.13." >&2
  echo "Recreate it with Python 3.13 or newer." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js 24.18.0 or newer and npm are required." >&2
  exit 1
fi

NODE_VERSION="$(node -p 'process.versions.node')"
if ! node -e '
const [major, minor, patch] = process.versions.node.split(".").map(Number);
process.exit(
  major > 24 || (major === 24 && (minor > 18 || (minor === 18 && patch >= 0))) ? 0 : 1,
);
'; then
  echo "Node.js 24.18.0 or newer is required; found $NODE_VERSION." >&2
  exit 1
fi

NPM_VERSION="$(npm --version)"
if ! NPM_VERSION="$NPM_VERSION" node -e '
const version = process.env.NPM_VERSION;
if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version)) {
  process.exit(1);
}
const [major, minor, patch] = version.split(".").map(Number);
process.exit(
  major > 11 || (major === 11 && (minor > 16 || (minor === 16 && patch >= 0))) ? 0 : 1,
);
'; then
  echo "npm 11.16.0 or newer is required; found $NPM_VERSION." >&2
  echo "Upgrade it with: npm install --global npm@^11.16.0 --no-fund" >&2
  exit 1
fi

if [ ! -x "$VENV_PYTHON" ]; then
  echo "Creating Python virtual environment at $VENV_DIR..."
  "$PYTHON" -m venv "$VENV_DIR"
fi

echo "Installing Python development dependencies..."
"$VENV_PYTHON" -m pip install --upgrade "pip>=25.1"
"$VENV_PYTHON" -m pip install --group dev

# Install the repository-managed Git hook, replacing a pre-commit shim left by
# an older checkout when necessary.
echo "Installing the prek Git hook..."
"$VENV_PREK" install -f

# Finder can leave .DS_Store files inside generated dependency directories.
# npm ci removes installed packages before reinstalling them, but these
# unmanaged files can leave a package scope non-empty and make npm fail with
# ENOTEMPTY while pruning node_modules.
if [ -d "$REPO_ROOT/frontend/node_modules" ]; then
  find "$REPO_ROOT/frontend/node_modules" -type f -name .DS_Store -exec rm -f {} \;
fi

echo "Installing locked frontend dependencies with Node.js $NODE_VERSION and npm $NPM_VERSION..."
if ! npm ci --prefix frontend --strict-allow-scripts --no-fund; then
  # Finder may recreate .DS_Store while npm is pruning node_modules. Retry only
  # when that exact condition caused the failed install; other npm errors
  # should fail setup immediately.
  if [ -d "$REPO_ROOT/frontend/node_modules" ] &&
    [ -n "$(find "$REPO_ROOT/frontend/node_modules" -type f -name .DS_Store -print)" ]; then
    echo "Removing macOS metadata recreated during npm cleanup and retrying..."
    find "$REPO_ROOT/frontend/node_modules" -type f -name .DS_Store -exec rm -f {} \;
    npm ci --prefix frontend --strict-allow-scripts --no-fund
  else
    exit 1
  fi
fi

echo "Installing Playwright Chromium..."
npm --prefix frontend run test:e2e:install

echo "Development environment setup complete."
echo "Run ./scripts/lint.sh to validate it."
