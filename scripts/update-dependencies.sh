#!/bin/sh
set -eu

# Refresh the local Python environment, development-tool pins, and frontend
# dependencies. Review generated configuration and lockfile changes afterward.

SCRIPT_DIR="$(CDPATH='' cd -P "$(dirname "$0")" && pwd)"
REPO_ROOT="$(CDPATH='' cd -P "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

if ! command -v uv >/dev/null 2>&1; then
  echo "uv is required." >&2
  exit 1
fi

echo "Resolving the newest Python dependencies and rewriting uv.lock..."
uv lock --upgrade
echo "Installing the new lock..."
uv sync

echo "Updating prek hook revisions..."
uv run prek update --exclude-repo https://github.com/biomejs/pre-commit

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

echo "Synchronizing the Biome prek hook revision..."
node scripts/sync-biome-prek-hook.mjs "$BIOME_VERSION_AFTER" prek.toml

echo "Applying compatible frontend security fixes to the lockfile..."
npm --prefix frontend audit fix --package-lock-only --ignore-scripts --no-fund

# Re-resolve lockfile placement after all dependency updates, including audit
# remediations. This prevents optional peer dependencies from remaining
# incompatibly hoisted at root.
echo "Normalizing the frontend lockfile..."
npm --prefix frontend install --package-lock-only --ignore-scripts \
  --strict-allow-scripts --no-audit --no-fund

echo "Synchronizing the frontend environment with the normalized lockfile..."
npm ci --prefix frontend --strict-allow-scripts --no-audit --no-fund

echo "Auditing the updated frontend dependency tree..."
npm --prefix frontend audit --no-fund

echo "Dependency update complete. Review and validate the changed files."
