/** Synchronize the Biome prek hook to a published compatible stable tag. */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const BIOME_PREK_REPOSITORY = 'https://github.com/biomejs/pre-commit.git';
const BIOME_PREK_REVISION_PATTERN =
  /(repo = "https:\/\/github\.com\/biomejs\/pre-commit"\nrev = ")([^"]+)(")/g;
const STABLE_TAG_PATTERN = /^\S+\s+refs\/tags\/v(\d+)\.(\d+)\.(\d+)$/;

/** Parse an exact stable semantic version into comparable numeric components. */
function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Expected an exact stable semantic version; found ${version}.`);
  }

  const parts = match.slice(1).map(Number);
  if (!parts.every(Number.isSafeInteger)) {
    throw new Error(`Expected safe integer version components; found ${version}.`);
  }
  return parts;
}

/** Compare two numeric semantic-version component arrays. */
function compareVersions(left, right) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }
  return 0;
}

/** Return the newest stable Biome prek tag no newer than the npm Biome version. */
export function selectCompatibleTag(biomeVersion, remoteTags) {
  const target = parseVersion(biomeVersion);
  const candidates = remoteTags
    .split('\n')
    .map((line) => STABLE_TAG_PATTERN.exec(line))
    .filter(Boolean)
    .map((match) => match.slice(1).map(Number))
    .filter((tag) => tag.every(Number.isSafeInteger))
    .filter((tag) => tag[0] === target[0] && compareVersions(tag, target) <= 0);

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort(compareVersions);
  return `v${candidates.at(-1).join('.')}`;
}

/** Replace exactly one Biome prek revision and report whether the config changed. */
export function updatePrekRevision(configPath, revision) {
  const input = readFileSync(configPath, 'utf8');
  const matches = [...input.matchAll(BIOME_PREK_REVISION_PATTERN)];
  if (matches.length !== 1) {
    throw new Error(`Expected one Biome repository in ${configPath}; found ${matches.length}.`);
  }

  const output = input.replace(
    BIOME_PREK_REVISION_PATTERN,
    (_match, prefix, _currentRevision, suffix) => `${prefix}${revision}${suffix}`,
  );
  if (output === input) {
    return false;
  }

  writeFileSync(configPath, output);
  return true;
}

/** Fetch the published tag list without cloning or checking out a hook repository. */
function fetchRemoteTags() {
  return execFileSync('git', ['ls-remote', '--refs', '--tags', BIOME_PREK_REPOSITORY], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

/** Synchronize a prek config, retaining its current revision on lookup failure. */
function main() {
  const [biomeVersion, configPath] = process.argv.slice(2);
  if (!biomeVersion || !configPath || process.argv.length !== 4) {
    throw new Error('Usage: sync-biome-prek-hook.mjs BIOME_VERSION PREK_CONFIG_PATH');
  }

  let remoteTags;
  try {
    remoteTags = fetchRemoteTags();
  } catch (error) {
    console.warn(
      `Could not look up Biome prek tags; keeping the current revision: ${error.message}`,
    );
    return;
  }

  const revision = selectCompatibleTag(biomeVersion, remoteTags);
  if (!revision) {
    console.warn(
      `No stable Biome prek tag is compatible with ${biomeVersion}; keeping the current revision.`,
    );
    return;
  }

  if (updatePrekRevision(configPath, revision)) {
    console.log(`Updated Biome prek hook to ${revision} for Biome ${biomeVersion}.`);
  } else {
    console.log(`Biome prek hook already uses ${revision}.`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
