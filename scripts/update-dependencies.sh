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

echo "Synchronizing prek mypy hook dependencies..."
if [ -x "$VENV_PYTHON" ]; then
  "$VENV_PYTHON" scripts/sync-mypy-hook-dependencies.py
elif command -v python3 >/dev/null 2>&1; then
  python3 scripts/sync-mypy-hook-dependencies.py
else
  echo "Python 3 is required to synchronize mypy hook dependencies." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js 24.18.0 or newer and npm 11.16.0 or newer are required." >&2
  exit 1
fi

NODE_VERSION="$(node -p 'process.versions.node')"
if ! node -e '
const [major, minor, patch] = process.versions.node.split(".").map(Number);
process.exit(
  major > 24 || (major === 24 && (minor > 18 || (minor === 18 && patch >= 0))) ? 0 : 1,
);
'; then
  echo "Node.js 24.18.0 or newer is required; found $NODE_VERSION." >&2
  exit 1
fi

NPM_VERSION="$(npm --version)"
if ! NPM_VERSION="$NPM_VERSION" node -e '
const version = process.env.NPM_VERSION;
if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version)) {
  process.exit(1);
}
const [major, minor, patch] = version.split(".").map(Number);
process.exit(
  major > 11 || (major === 11 && (minor > 16 || (minor === 16 && patch >= 0))) ? 0 : 1,
);
'; then
  echo "npm 11.16.0 or newer is required; found $NPM_VERSION." >&2
  echo "Upgrade it with: npm install --global npm@^11.16.0 --no-fund" >&2
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
npm --prefix frontend update --save --strict-allow-scripts --no-audit --no-fund

# Biome is intentionally exact-pinned. Refresh it within its current major
# release line, then migrate its configuration only when the version changes.
echo "Updating Biome within major version $BIOME_MAJOR..."
npm --prefix frontend install --save-dev --save-exact \
  "@biomejs/biome@^$BIOME_MAJOR.0.0" --strict-allow-scripts --no-audit --no-fund

BIOME_VERSION_AFTER="$(
  node -p "require('./frontend/package.json').devDependencies['@biomejs/biome']"
)"
if [ "$BIOME_VERSION_BEFORE" != "$BIOME_VERSION_AFTER" ]; then
  echo "Migrating Biome configuration from $BIOME_VERSION_BEFORE to $BIOME_VERSION_AFTER..."
  frontend/node_modules/.bin/biome migrate --write --config-path biome.json
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
npm --prefix frontend install --package-lock-only --ignore-scripts \
  --strict-allow-scripts --no-audit --no-fund

echo "Synchronizing the frontend environment with the normalized lockfile..."
npm ci --prefix frontend --strict-allow-scripts --no-audit --no-fund

echo "Auditing the updated frontend dependency tree..."
npm --prefix frontend audit --no-fund

echo "Dependency update complete. Review and validate the changed files."
