#!/bin/sh
set -eu

# Create the local Python environment and install the locked frontend
# dependencies required for development, linting, and tests.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
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

  echo "Creating Python virtual environment at $VENV_DIR..."
  "$PYTHON" -m venv "$VENV_DIR"
fi

if ! "$VENV_PYTHON" -c 'import sys; raise SystemExit(sys.version_info < (3, 13))'; then
  echo "The existing .venv uses Python older than 3.13." >&2
  echo "Recreate it with Python 3.13 or newer." >&2
  exit 1
fi

echo "Installing Python development dependencies..."
"$VENV_PYTHON" -m pip install --upgrade "pip>=25.1"
"$VENV_PYTHON" -m pip install --group dev

# Install the repository-managed Git hook, replacing a pre-commit shim left by
# an older checkout when necessary.
echo "Installing the prek Git hook..."
"$VENV_PREK" install -f

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js 22.20.0 or newer and npm are required." >&2
  exit 1
fi

NODE_VERSION="$(node -p 'process.versions.node')"
if ! node -e '
const [major, minor, patch] = process.versions.node.split(".").map(Number);
process.exit(
  major > 22 || (major === 22 && (minor > 20 || (minor === 20 && patch >= 0))) ? 0 : 1,
);
'; then
  echo "Node.js 22.20.0 or newer is required; found $NODE_VERSION." >&2
  exit 1
fi

echo "Installing locked frontend dependencies with Node.js $NODE_VERSION..."
npm ci --prefix frontend --no-fund

echo "Development environment setup complete."
echo "Run ./scripts/lint.sh to validate it."
