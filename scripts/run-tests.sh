#!/bin/sh
set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(dirname -- "$SCRIPT_DIR")"
VENV_PYTHON="$REPO_ROOT/.venv/bin/python"
FRONTEND_DIR="$REPO_ROOT/frontend"

if [ ! -x "$VENV_PYTHON" ]; then
  echo "Missing repository virtual environment: $VENV_PYTHON" >&2
  echo "Create .venv and install requirements-dev.txt before running tests." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to run the frontend test suite." >&2
  exit 1
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "Missing frontend dependencies. Run: cd frontend && npm ci" >&2
  exit 1
fi

echo "Running backend tests..."
(
  cd "$REPO_ROOT"
  "$VENV_PYTHON" -m pytest
)

echo "Running frontend end-to-end tests..."
npm --prefix "$FRONTEND_DIR" run test:e2e
