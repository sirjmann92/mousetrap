#!/bin/sh
set -eu

# Refresh the local Python environment, development-tool pins, and frontend
# dependencies. Review generated configuration and lockfile changes afterward.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VENV_PYTHON="$REPO_ROOT/.venv/bin/python"
VENV_PREK="$REPO_ROOT/.venv/bin/prek"

cd "$REPO_ROOT"

# Update the local Python environment when present, but keep the remaining
# maintenance useful from a checkout that has not run setup.sh.
if [ -x "$VENV_PYTHON" ]; then
  echo "Updating Python development dependencies..."
  "$VENV_PYTHON" -m pip install --upgrade --group dev
  "$VENV_PYTHON" -m pip check
else
  echo "Skipping local Python dependency updates because .venv is not set up."
fi

# Prefer the project installation. A global prek can still update hook
# revisions when .venv is absent; otherwise leave that step explicitly skipped.
if [ -x "$VENV_PREK" ]; then
  PREK="$VENV_PREK"
elif command -v prek >/dev/null 2>&1; then
  PREK="$(command -v prek)"
else
  PREK=""
fi

if [ -n "$PREK" ]; then
  echo "Updating prek hook revisions..."
  "$PREK" update
else
  echo "Skipping prek hook updates because prek is not installed."
fi

echo "Updating frontend dependencies within package.json constraints..."
npm --prefix frontend update --no-audit --no-fund

# Re-resolve lockfile placement after npm update. This prevents optional peer
# dependencies from leaving incompatible transitive packages hoisted at root.
echo "Normalizing the frontend lockfile..."
npm --prefix frontend install --package-lock-only --ignore-scripts --no-audit --no-fund

echo "Synchronizing the frontend environment with the normalized lockfile..."
npm ci --prefix frontend --no-audit --no-fund

echo "Auditing the updated frontend dependency tree..."
npm --prefix frontend audit --no-fund

echo "Dependency update complete. Review and validate the changed files."
