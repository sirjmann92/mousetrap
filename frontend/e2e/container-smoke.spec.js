import { expect, test } from '@playwright/test';

test('@container serves the production UI and preserves mounted configuration', async ({
  page,
  request,
}) => {
  test.skip(!process.env.E2E_BASE_URL, 'Set E2E_BASE_URL to a running production container');

  const versionResponse = await request.get('/api/version');
  expect(versionResponse.ok()).toBeTruthy();
  expect(await versionResponse.json()).toEqual({ version: expect.any(String) });

  const sessionsResponse = await request.get('/api/sessions');
  expect(sessionsResponse.ok()).toBeTruthy();
  expect(await sessionsResponse.json()).toEqual({ sessions: [] });

  const proxiesResponse = await request.get('/api/proxies');
  expect(proxiesResponse.ok()).toBeTruthy();
  expect(await proxiesResponse.json()).toMatchObject({
    'container-smoke-proxy': {
      host: '127.0.0.1',
      port: 8080,
    },
  });

  await page.goto('/');
  await expect(page.getByText('MouseTrap').first()).toBeVisible();
  await expect(page.getByText('Create a new session to get started.')).toBeVisible();
  await expect(page.getByText('Notifications', { exact: true })).toBeVisible();
  await expect(page.getByText('Proxy Configuration', { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText('Create a new session to get started.')).toBeVisible();
});
