import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

export default function globalTeardown() {
  const configDir = process.env.MOUSETRAP_E2E_CONFIG_DIR;
  const expectedPrefix = resolve(join(tmpdir(), 'mousetrap-playwright-'));

  if (configDir && resolve(configDir).startsWith(expectedPrefix)) {
    rmSync(configDir, { force: true, recursive: true });
  }
}
