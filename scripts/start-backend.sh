#!/bin/sh
set -eu

# Start the FastAPI backend for local source development.
#
# Use this helper directly, through `npm run backend`, or through `npm run dev`.
# Production containers use start.sh instead.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VENV_PY="$REPO_ROOT/.venv/bin/python"

# Run from the repository root so imports and relative environment overrides
# behave consistently even when this script is invoked by absolute path.
cd "$REPO_ROOT"

# Keep all local configuration and state under the ignored repository config/
# directory. CONFIG_DIR covers config.yaml, sessions, notifications, proxies,
# last-session state, the SQLite event log, and port-monitor configuration.
# An explicit CONFIG_DIR or per-file path override still takes precedence.
CONFIG_DIR="${CONFIG_DIR:-$REPO_ROOT/config}"
export CONFIG_DIR
mkdir -p "$CONFIG_DIR"
if [ ! -w "$CONFIG_DIR" ]; then
  echo "Local configuration directory is not writable: $CONFIG_DIR" >&2
  exit 1
fi

# VITE_BACKEND_PORT is shared with Vite during `npm run dev`; PORT remains the
# direct backend fallback. Defaults keep both services aligned on port 39842.
PORT="${VITE_BACKEND_PORT:-${PORT:-39842}}"

# Prefer the repository virtual environment so local runs use the dependencies
# declared in pyproject.toml.
if [ -x "$VENV_PY" ]; then
  PYTHON="$VENV_PY"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON="$(command -v python3)"
else
  echo "Python 3 was not found. Install Python 3.13 and create .venv." >&2
  exit 1
fi

if ! "$PYTHON" -c "import uvicorn" >/dev/null 2>&1; then
  echo "Uvicorn is not installed for $PYTHON." >&2
  echo "Create the development environment with:" >&2
  echo "  python3.13 -m venv .venv" >&2
  echo "  .venv/bin/python -m pip install --upgrade 'pip>=25.1'" >&2
  echo "  .venv/bin/python -m pip install --group dev" >&2
  exit 1
fi

echo "Starting MouseTrap with $PYTHON"
echo "Backend: http://127.0.0.1:$PORT"
echo "Local configuration: $CONFIG_DIR"
exec "$PYTHON" -m uvicorn backend.app:app \
  --host 127.0.0.1 \
  --port "$PORT" \
  --reload
