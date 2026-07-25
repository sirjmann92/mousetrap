import { expect, test } from '@playwright/test';

async function choose(page, label, option) {
  await page.getByRole('combobox', { name: label, exact: true }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
  await expect(page.getByRole('listbox')).toBeHidden();
}

test.describe
  .serial('MouseTrap browser lifecycle', () => {
    test.beforeEach(async ({ request }) => {
      const sessions = await request.get('/api/sessions');
      expect(sessions.ok()).toBeTruthy();
      for (const label of (await sessions.json()).sessions) {
        const deleted = await request.delete(`/api/session/delete/${encodeURIComponent(label)}`);
        expect(deleted.ok()).toBeTruthy();
      }

      const proxies = await request.get('/api/proxies');
      expect(proxies.ok()).toBeTruthy();
      for (const label of Object.keys(await proxies.json())) {
        const deleted = await request.delete(`/api/proxies/${encodeURIComponent(label)}`);
        expect(deleted.ok()).toBeTruthy();
      }

      expect((await request.post('/api/notify/config', { data: {} })).ok()).toBeTruthy();
      expect((await request.delete('/api/ui_event_log')).ok()).toBeTruthy();
    });

    test('starts with backend version and persists the selected theme', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByText('MouseTrap').first()).toBeVisible();
      await expect(page.getByText('ve2e', { exact: true })).toBeVisible();
      await expect(page.getByText('Create a new session to get started.')).toBeVisible();

      await page.getByLabel('toggle dark mode').check();
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(18, 18, 18)');
      await page.reload();
      await expect(page.getByLabel('toggle dark mode')).toBeChecked();
    });

    test('creates, configures, renames, and deletes a session', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Create New Session', exact: true }).click();

      const config = page.getByText('Session Configuration', { exact: true });
      await expect(page.getByLabel('Session Label')).toHaveValue('Session1');
      await page.getByLabel('Session Label').fill('Primary');
      await choose(page, 'Session Type', 'IP Locked');
      await choose(page, 'IP Monitoring', 'Static (No Monitoring)');
      await choose(page, 'Interval', '10');
      await page.getByRole('textbox', { name: 'MAM ID', exact: true }).fill('e2e-mam-id');
      await page.getByRole('textbox', { name: 'IP Address', exact: true }).fill('192.0.2.10');
      await page.getByRole('button', { name: 'SAVE', exact: true }).click();
      await expect(page.getByText('Session saved successfully.')).toBeVisible();

      await page.reload();
      await expect(page.getByRole('combobox', { name: 'Session', exact: true })).toContainText(
        'Primary',
      );
      await config.click();
      await expect(page.getByLabel('Session Label')).toBeVisible();
      await expect(page.getByLabel('Session Label')).toHaveValue('Primary');

      await page.getByRole('button', { name: 'Delete session' }).click();
      await expect(page.getByRole('dialog', { name: 'Delete Session' })).toContainText('Primary');
      await page.getByRole('button', { name: 'Delete', exact: true }).click();
      await expect(page.getByText('Create a new session to get started.')).toBeVisible();
    });

    test('persists proxy CRUD, assigns it to a session, and records events', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Create New Session', exact: true }).click();

      await page.getByText('Proxy Configuration', { exact: true }).click();
      await page.getByRole('textbox', { name: 'Label', exact: true }).fill('local-proxy');
      await page.getByRole('textbox', { name: 'Host', exact: true }).fill('127.0.0.1');
      await page.getByRole('spinbutton', { name: 'Port', exact: true }).fill('8080');
      await page.getByRole('textbox', { name: 'Username', exact: true }).fill('tester');
      await page.getByRole('button', { name: 'Save Proxy' }).click();
      await expect(page.getByText('Proxy: local-proxy')).toBeVisible();

      await page.reload();
      await page.getByText('Session Configuration', { exact: true }).click();
      await page.getByLabel('Session Label').fill('Proxied');
      await choose(page, 'Session Type', 'ASN Locked');
      await choose(page, 'IP Monitoring', 'Static (No Monitoring)');
      await choose(page, 'Interval', '15');
      await page.getByRole('textbox', { name: 'MAM ID', exact: true }).fill('e2e-proxy-mam-id');
      await page.getByRole('textbox', { name: 'IP Address', exact: true }).fill('192.0.2.20');
      await page.getByRole('combobox', { name: 'Proxy', exact: true }).click();
      await page.getByRole('option', { name: /local-proxy/ }).click();
      await expect(page.getByRole('listbox')).toBeHidden();
      await page.getByRole('button', { name: 'SAVE', exact: true }).click();
      await expect(page.getByText('Session saved successfully.')).toBeVisible();

      await page.getByRole('button', { name: 'View event log' }).click();
      await expect(page.getByRole('dialog', { name: 'Event Log' })).toContainText(
        /Session 'Proxied' (created|saved)/,
      );
      await page.getByRole('button', { name: 'Clear event log' }).click();
      await expect(page.getByText('No events yet.')).toBeVisible();
      await page.getByRole('button', { name: 'Close event log' }).click();

      await page.getByText('Proxy Configuration', { exact: true }).click();
      await page.getByRole('button', { name: 'Edit proxy local-proxy' }).click();
      await page.getByRole('spinbutton', { name: 'Port', exact: true }).fill('8081');
      await page.getByRole('button', { name: 'Update Proxy' }).click();
      await expect(page.getByText('Host: 127.0.0.1:8081')).toBeVisible();

      await page.getByRole('button', { name: 'Delete proxy local-proxy' }).click();
      await page.getByRole('button', { name: 'Delete', exact: true }).click();
      await expect(page.getByText('No proxies configured.')).toBeVisible();
    });

    test('saves notification configuration without sending a notification', async ({ page }) => {
      await page.goto('/');
      await page.getByText('Notifications', { exact: true }).click();
      await page.getByText('Configuration', { exact: true }).click();
      await page
        .getByRole('textbox', { name: 'Webhook URL', exact: true })
        .fill('https://example.invalid/mousetrap-e2e');
      await page.getByRole('button', { name: 'Save Settings' }).click();
      await expect(page.getByText('Settings saved.')).toBeVisible();

      await page.reload();
      await page.getByText('Notifications', { exact: true }).click();
      await page.getByText('Configuration', { exact: true }).click();
      await expect(page.getByRole('textbox', { name: 'Webhook URL', exact: true })).toHaveValue(
        'https://example.invalid/mousetrap-e2e',
      );
    });

    test('shows a session save failure without persisting it', async ({ page, request }) => {
      await request.post('/api/session/save', {
        data: {
          check_freq: 10,
          label: 'FailureCase',
          mam: {
            ip_monitoring_mode: 'static',
            mam_id: 'failure-case-mam-id',
            session_type: 'IP Locked',
          },
          mam_ip: '192.0.2.30',
        },
      });
      await page.goto('/');
      await page.getByText('Session Configuration', { exact: true }).click();
      await page.getByRole('textbox', { name: 'IP Address', exact: true }).fill('192.0.2.31');
      await page.route('**/api/session/save', (route) =>
        route.fulfill({ body: '{"detail":"simulated failure"}', status: 500 }),
      );
      await page.getByRole('button', { name: 'SAVE', exact: true }).click();
      await expect(page.getByText('Error saving session: Failed to save session')).toBeVisible();

      const persisted = await request.get('/api/session/FailureCase');
      expect(persisted.ok()).toBeTruthy();
      expect((await persisted.json()).mam_ip).toBe('192.0.2.30');

      await page.reload();
      await page.getByText('Session Configuration', { exact: true }).click();
      await expect(page.getByRole('textbox', { name: 'IP Address', exact: true })).toHaveValue(
        '192.0.2.30',
      );
    });
  });
