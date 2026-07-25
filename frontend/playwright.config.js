import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const externalBaseUrl = process.env.E2E_BASE_URL;
const backendPort = '39852';
const frontendPort = '5174';
const localPython = resolve('../.venv/bin/python');
const python = process.env.E2E_PYTHON || (existsSync(localPython) ? localPython : 'python3');
const configDir = externalBaseUrl
  ? undefined
  : mkdtempSync(join(tmpdir(), 'mousetrap-playwright-'));
if (configDir) {
  process.env.MOUSETRAP_E2E_CONFIG_DIR = configDir;
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  globalTeardown: externalBaseUrl ? undefined : './e2e/support/global-teardown.js',
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'line',
  timeout: 30_000,
  expect: { timeout: 7_500 },
  use: {
    baseURL: externalBaseUrl || `http://127.0.0.1:${frontendPort}`,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: externalBaseUrl
    ? undefined
    : [
        {
          command: `${python} frontend/e2e/support/backend_server.py`,
          cwd: '..',
          env: {
            ...process.env,
            APP_VERSION: 'e2e',
            CONFIG_DIR: configDir,
            E2E_BACKEND_PORT: backendPort,
            NOTIFY_CONFIG_PATH: join(configDir, 'notify.yaml'),
            PORT_MONITOR_CONFIG_PATH: join(configDir, 'port-monitoring.yaml'),
          },
          reuseExistingServer: false,
          stderr: 'pipe',
          stdout: 'pipe',
          timeout: 30_000,
          url: `http://127.0.0.1:${backendPort}/api/version`,
        },
        {
          command: `npm run start -- --host 127.0.0.1 --port ${frontendPort} --strictPort`,
          env: {
            ...process.env,
            VITE_BACKEND_URL: `http://127.0.0.1:${backendPort}`,
          },
          reuseExistingServer: false,
          stderr: 'pipe',
          stdout: 'pipe',
          timeout: 30_000,
          url: `http://127.0.0.1:${frontendPort}`,
        },
      ],
});
