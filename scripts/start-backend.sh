#!/bin/sh
set -eu

# Start the FastAPI backend for local source development.
#
# Use this helper directly, through `npm run backend`, or through `npm run dev`.
# Production containers use start.sh instead.

SCRIPT_DIR="$(CDPATH='' cd -P "$(dirname "$0")" && pwd)"
REPO_ROOT="$(CDPATH='' cd -P "$SCRIPT_DIR/.." && pwd)"

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

if ! command -v uv >/dev/null 2>&1; then
  echo "uv was not found. Install it, then create the development environment with:" >&2
  echo "  uv sync" >&2
  exit 1
fi

echo "Starting MouseTrap"
echo "Backend: http://127.0.0.1:$PORT"
echo "Local configuration: $CONFIG_DIR"
exec uv run uvicorn backend.app:app \
  --host 127.0.0.1 \
  --port "$PORT" \
  --reload
