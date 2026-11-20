#!/bin/sh
set -eu

# Run the same repository-wide linting, formatting, and type checks as the
# GitHub lint workflow. Hooks that support automatic fixes may modify files.

SCRIPT_DIR="$(CDPATH='' cd -P "$(dirname "$0")" && pwd)"
REPO_ROOT="$(CDPATH='' cd -P "$SCRIPT_DIR/.." && pwd)"
FRONTEND_TSC="$REPO_ROOT/frontend/node_modules/.bin/tsc"

cd "$REPO_ROOT"

# The local TypeScript hook uses the dependencies pinned in the frontend
# lockfile rather than downloading tools through npx.
if ! command -v npm >/dev/null 2>&1 || [ ! -x "$FRONTEND_TSC" ]; then
  echo "Frontend dependencies are not installed. Run:" >&2
  echo "  npm ci --prefix frontend --strict-allow-scripts --no-fund" >&2
  exit 1
fi

if ! command -v uv >/dev/null 2>&1; then
  echo "uv was not found. Install it, then install the development dependency group:" >&2
  echo "  uv sync" >&2
  exit 1
fi

echo "Running repository lint, format, and type checks..."
uv run prek run --all-files

# Only what ships: the production image carries the built bundle, so advisories
# against build and test tools would fail every local run with nothing to fix.
# CI's dependency review covers those when a change adds or updates one.
echo "Auditing shipped frontend dependencies..."
npm --prefix frontend audit --omit=dev --no-fund

# Build the production bundle to catch module-resolution and bundler errors
# that static linting and TypeScript checks cannot detect.
echo "Building the frontend production bundle..."
npm --prefix frontend run build
