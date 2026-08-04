#!/bin/sh
set -eu

# Run the complete local test gate:
#   1. Execute the full backend pytest suite in the repository virtual environment.
#   2. Execute the Playwright development E2E suite against isolated FastAPI and
#      Vite servers with temporary application configuration.
# With --full, also build and test the production Docker image.
# With --container, run only the production Docker image smoke test.

SCRIPT_DIR="$(CDPATH='' cd -P "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
VENV_PYTHON="$REPO_ROOT/.venv/bin/python"
FRONTEND_DIR="$REPO_ROOT/frontend"
RUN_DEVELOPMENT=true
RUN_CONTAINER=false
BACKEND_STATUS=""
FRONTEND_STATUS=""
CONTAINER_STATUS=""
EXIT_STATUS=0

usage() {
  cat <<EOF
Usage: ./scripts/test.sh [--full | --container]

  no option     Run backend pytest and development Playwright tests.
  --full        Run the default tests, then the production container smoke test.
  --container   Run only the production container smoke test.
EOF
}

if [ "$#" -gt 1 ]; then
  usage >&2
  exit 2
fi

case "${1:-}" in
  "")
    ;;
  --full)
    RUN_CONTAINER=true
    ;;
  --container)
    RUN_DEVELOPMENT=false
    RUN_CONTAINER=true
    ;;
  -h | --help)
    usage
    exit 0
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac

# Fail early with actionable setup instructions instead of partially running the gate.
if [ "$RUN_DEVELOPMENT" = true ] && [ ! -x "$VENV_PYTHON" ]; then
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

if [ "$RUN_DEVELOPMENT" = true ]; then
  echo "Running backend tests..."
  if (
    # Run from the repository root so pytest uses the project configuration.
    cd "$REPO_ROOT"
    "$VENV_PYTHON" -m pytest tests/backend
  ); then
    BACKEND_STATUS="PASS"
  else
    BACKEND_STATUS="FAIL"
    EXIT_STATUS=1
  fi

  echo "Running frontend end-to-end tests..."
  # Playwright's configuration starts and cleans up the isolated development servers.
  if npm --prefix "$FRONTEND_DIR" run test:e2e; then
    FRONTEND_STATUS="PASS"
  else
    FRONTEND_STATUS="FAIL"
    EXIT_STATUS=1
  fi
fi

if [ "$RUN_CONTAINER" = true ]; then
  if "$SCRIPT_DIR/test-container.sh"; then
    CONTAINER_STATUS="PASS"
  else
    CONTAINER_STATUS="FAIL"
    EXIT_STATUS=1
  fi
fi

if [ "$RUN_DEVELOPMENT" = true ]; then
  if ! ALLOW_MISSING_COVERAGE=true \
    BACKEND_TEST_STATUS="$BACKEND_STATUS" \
    FRONTEND_TEST_STATUS="$FRONTEND_STATUS" \
    CONTAINER_TEST_STATUS="$CONTAINER_STATUS" \
    node "$SCRIPT_DIR/coverage-summary.mjs"; then
    EXIT_STATUS=1
  fi
fi

echo
echo "=============================== Final Test Summary ==============================="
echo "Test surface                 Result"
echo "---------------------------  ------"
if [ "$RUN_DEVELOPMENT" = true ]; then
  printf '%-27s  %s\n' "Backend pytest" "$BACKEND_STATUS"
  printf '%-27s  %s\n' "Frontend Playwright E2E" "$FRONTEND_STATUS"
fi
if [ "$RUN_CONTAINER" = true ]; then
  printf '%-27s  %s\n' "Docker container smoke" "$CONTAINER_STATUS"
fi

exit "$EXIT_STATUS"
