#!/bin/sh
set -eu

# Run the complete local test gate:
#   1. Execute the full backend pytest suite in the repository virtual environment.
#   2. Execute the Playwright development E2E suite against isolated FastAPI and
#      Vite servers with temporary application configuration.
# The production-container smoke suite is intentionally left to GitHub Actions.

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(dirname -- "$SCRIPT_DIR")"
VENV_PYTHON="$REPO_ROOT/.venv/bin/python"
FRONTEND_DIR="$REPO_ROOT/frontend"

# Fail early with actionable setup instructions instead of partially running the gate.
if [ ! -x "$VENV_PYTHON" ]; then
  echo "Missing repository virtual environment: $VENV_PYTHON" >&2
  echo "Run ./scripts/setup.sh before running tests." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to run the frontend test suite." >&2
  exit 1
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "Missing frontend dependencies. Run ./scripts/setup.sh before running tests." >&2
  exit 1
fi

echo "Running backend tests..."
(
  # Run from the repository root so pytest uses the project configuration.
  cd "$REPO_ROOT"
  "$VENV_PYTHON" -m pytest
)

echo "Running frontend end-to-end tests..."
# Playwright's configuration starts and cleans up the isolated development servers.
npm --prefix "$FRONTEND_DIR" run test:e2e
