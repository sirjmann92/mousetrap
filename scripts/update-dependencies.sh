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
  # Biome is synchronized with the npm package after frontend updates.
  "$PREK" update --exclude-repo https://github.com/biomejs/pre-commit
else
  echo "Skipping prek hook updates because prek is not installed."
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm 11 or newer is required." >&2
  exit 1
fi

NPM_VERSION="$(npm --version)"
NPM_MAJOR="${NPM_VERSION%%.*}"
case "$NPM_MAJOR" in
  ''|*[!0-9]*)
    echo "Could not determine the npm major version from: $NPM_VERSION" >&2
    exit 1
    ;;
esac
if [ "$NPM_MAJOR" -lt 11 ]; then
  echo "npm 11 or newer is required; found $NPM_VERSION." >&2
  echo "Upgrade it with: npm install --global npm@11 --no-fund" >&2
  exit 1
fi

BIOME_VERSION_BEFORE="$(
  node -p "require('./frontend/package.json').devDependencies['@biomejs/biome']"
)"
BIOME_MAJOR="$(
  BIOME_VERSION="$BIOME_VERSION_BEFORE" node -e '
    const version = process.env.BIOME_VERSION;
    if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version)) {
      console.error("Expected an exact @biomejs/biome version; found " + version + ".");
      process.exit(1);
    }
    process.stdout.write(version.split(".")[0]);
  '
)"

echo "Updating frontend dependency declarations within package.json constraints..."
npm --prefix frontend update --save --no-audit --no-fund

# Biome is intentionally exact-pinned. Refresh it within its current major
# release line, then migrate its configuration only when the version changes.
echo "Updating Biome within major version $BIOME_MAJOR..."
npm --prefix frontend install --save-dev --save-exact \
  "@biomejs/biome@^$BIOME_MAJOR.0.0" --no-audit --no-fund

BIOME_VERSION_AFTER="$(
  node -p "require('./frontend/package.json').devDependencies['@biomejs/biome']"
)"
if [ "$BIOME_VERSION_BEFORE" != "$BIOME_VERSION_AFTER" ]; then
  echo "Migrating Biome configuration from $BIOME_VERSION_BEFORE to $BIOME_VERSION_AFTER..."
  npm --prefix frontend exec -- biome migrate --write
else
  echo "Biome remains at $BIOME_VERSION_AFTER; skipping configuration migration."
fi

# The prek hook publishes matching Biome release tags. Keep it aligned even
# when prek is unavailable and the other hook revisions could not be updated.
BIOME_TARGET_VERSION="$BIOME_VERSION_AFTER" node -e '
  const fs = require("node:fs");
  const configPath = "prek.toml";
  const input = fs.readFileSync(configPath, "utf8");
  const pattern =
    /(repo = "https:\/\/github\.com\/biomejs\/pre-commit"\nrev = ")[^"]+(")/g;
  let replacements = 0;
  const output = input.replace(pattern, (_match, prefix, suffix) => {
    replacements += 1;
    return prefix + "v" + process.env.BIOME_TARGET_VERSION + suffix;
  });
  if (replacements !== 1) {
    console.error(
      "Expected one Biome repository in " + configPath + "; found " + replacements + ".",
    );
    process.exit(1);
  }
  if (output !== input) {
    fs.writeFileSync(configPath, output);
  }
'

# Re-resolve lockfile placement after npm update. This prevents optional peer
# dependencies from leaving incompatible transitive packages hoisted at root.
echo "Normalizing the frontend lockfile..."
npm --prefix frontend install --package-lock-only --ignore-scripts --no-audit --no-fund

echo "Synchronizing the frontend environment with the normalized lockfile..."
npm ci --prefix frontend --no-audit --no-fund

echo "Auditing the updated frontend dependency tree..."
npm --prefix frontend audit --no-fund

echo "Dependency update complete. Review and validate the changed files."
