#!/bin/sh
set -eu

# Refresh development-tool pins and frontend dependencies from the repository
# root. Review the resulting manifest and lockfile changes before committing.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VENV_PRE_COMMIT="$REPO_ROOT/.venv/bin/pre-commit"

cd "$REPO_ROOT"

# Prefer the project environment so autoupdate uses the version declared in
# pyproject.toml. Fall back to a globally available pre-commit executable.
if [ -x "$VENV_PRE_COMMIT" ]; then
  PRE_COMMIT="$VENV_PRE_COMMIT"
elif command -v pre-commit >/dev/null 2>&1; then
  PRE_COMMIT="$(command -v pre-commit)"
else
  echo "pre-commit was not found. Install the development dependency group:" >&2
  echo "  .venv/bin/python -m pip install --group dev" >&2
  exit 1
fi

echo "Updating pre-commit hook revisions..."
"$PRE_COMMIT" autoupdate

echo "Updating frontend dependencies within package.json constraints..."
npm --prefix frontend update --no-fund

echo "Auditing the updated frontend dependency tree..."
npm --prefix frontend audit --no-fund

echo "Dependency update complete. Review and validate the changed files."
