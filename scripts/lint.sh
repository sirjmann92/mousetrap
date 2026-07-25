#!/bin/sh
set -eu

# Run the same repository-wide linting, formatting, and type checks as the
# GitHub lint workflow. Hooks that support automatic fixes may modify files.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VENV_PRE_COMMIT="$REPO_ROOT/.venv/bin/pre-commit"
FRONTEND_TSC="$REPO_ROOT/frontend/node_modules/.bin/tsc"

cd "$REPO_ROOT"

# The local TypeScript hook uses the dependencies pinned in the frontend
# lockfile rather than downloading tools through npx.
if ! command -v npm >/dev/null 2>&1 || [ ! -x "$FRONTEND_TSC" ]; then
  echo "Frontend dependencies are not installed. Run:" >&2
  echo "  npm ci --prefix frontend --no-fund" >&2
  exit 1
fi

# Prefer the project environment used by local development, with a global
# pre-commit installation as a convenience fallback.
if [ -x "$VENV_PRE_COMMIT" ]; then
  PRE_COMMIT="$VENV_PRE_COMMIT"
elif command -v pre-commit >/dev/null 2>&1; then
  PRE_COMMIT="$(command -v pre-commit)"
else
  echo "pre-commit was not found. Install the development dependency group:" >&2
  echo "  .venv/bin/python -m pip install --group dev" >&2
  exit 1
fi

echo "Running repository lint, format, and type checks..."
"$PRE_COMMIT" run --all-files
