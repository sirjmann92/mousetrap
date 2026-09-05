import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test as base, expect } from '@playwright/test';

const repoRoot = resolve(__dirname, '../../..');
const rawCoverageDir = resolve(repoRoot, 'coverage/.nyc_output');
let coverageFileIndex = 0;

async function saveCoverage(page) {
  if (page.isClosed()) {
    return;
  }

  const coverage = await page.evaluate(() => globalThis.__coverage__).catch(() => undefined);
  if (!coverage || Object.keys(coverage).length === 0) {
    return;
  }

  mkdirSync(rawCoverageDir, { recursive: true });
  coverageFileIndex += 1;
  writeFileSync(
    resolve(rawCoverageDir, `${process.pid}-${coverageFileIndex}.json`),
    JSON.stringify(coverage),
  );
}

export const test = base.extend(
  /**
   * @type {import('@playwright/test').Fixtures<
   *   { collectCoverage: void },
   *   {},
   *   import('@playwright/test').PlaywrightTestArgs &
   *     import('@playwright/test').PlaywrightTestOptions,
   *   import('@playwright/test').PlaywrightWorkerArgs &
   *     import('@playwright/test').PlaywrightWorkerOptions
   * >}
   */ ({
    collectCoverage: [
      async ({ page }, use) => {
        const originalReload = page.reload.bind(page);
        page.reload = async (...args) => {
          await saveCoverage(page);
          return originalReload(...args);
        };

        await use();
        await saveCoverage(page);
      },
      { auto: true },
    ],
  }),
);

export { expect };
