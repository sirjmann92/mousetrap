import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = resolve(frontendDir, '..');
const rawCoverageDir = resolve(repoRoot, 'coverage/.nyc_output');
const reportDir = resolve(repoRoot, 'coverage/frontend');
const playwrightCli = resolve(frontendDir, 'node_modules/@playwright/test/cli.js');
const reportScript = resolve(frontendDir, 'e2e/support/report-coverage.mjs');

rmSync(rawCoverageDir, { force: true, recursive: true });
rmSync(reportDir, { force: true, recursive: true });
mkdirSync(rawCoverageDir, { recursive: true });

const playwrightEnv = { ...process.env, VITE_COVERAGE: 'true' };
delete playwrightEnv.E2E_BASE_URL;

const playwrightResult = spawnSync(
  process.execPath,
  [playwrightCli, 'test', '--grep-invert', '@container'],
  {
    cwd: frontendDir,
    env: playwrightEnv,
    stdio: 'inherit',
  },
);
const reportResult = spawnSync(process.execPath, [reportScript], {
  cwd: frontendDir,
  stdio: 'inherit',
});

if (playwrightResult.error) {
  throw playwrightResult.error;
}
if (reportResult.error) {
  throw reportResult.error;
}

const playwrightStatus = playwrightResult.status ?? 1;
const reportStatus = reportResult.status ?? 1;
process.exitCode = playwrightStatus === 0 ? reportStatus : playwrightStatus;
