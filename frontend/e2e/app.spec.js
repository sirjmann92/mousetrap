import { expect, test } from './support/coverage-fixture.js';

async function choose(page, label, option) {
  await page.getByRole('combobox', { name: label, exact: true }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
  await expect(page.getByRole('listbox')).toBeHidden();
}

function waitForPost(page, path) {
  return page.waitForResponse(
    (response) => response.url().endsWith(path) && response.request().method() === 'POST',
  );
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
      const saved = waitForPost(page, '/api/session/save');
      await page.getByRole('button', { name: 'SAVE', exact: true }).click();
      expect((await saved).ok()).toBeTruthy();

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
      const saved = waitForPost(page, '/api/session/save');
      await page.getByRole('button', { name: 'SAVE', exact: true }).click();
      expect((await saved).ok()).toBeTruthy();

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

      // A proxy a session still selects cannot be deleted, because clearing the
      // reference would leave that session connecting directly. The control is
      // disabled rather than accepting the click and refusing afterwards.
      const deleteProxy = page.getByRole('button', { name: 'Delete proxy local-proxy' });
      await expect(deleteProxy).toBeDisabled();
      // The disabled button fires no pointer events; its wrapper carries them.
      await deleteProxy.locator('xpath=..').hover();
      await expect(page.getByRole('tooltip')).toContainText("Used by session 'Proxied'");

      // Release it from the session and save. The delete control has to follow
      // that without a page reload, since usage changes with sessions and not
      // just with proxies.
      await page.getByRole('combobox', { name: 'Proxy', exact: true }).click();
      await page.getByRole('option', { name: 'None' }).click();
      await expect(page.getByRole('listbox')).toBeHidden();
      const released = waitForPost(page, '/api/session/save');
      await page.getByRole('button', { name: 'SAVE', exact: true }).click();
      expect((await released).ok()).toBeTruthy();

      const freed = page.getByRole('button', { name: 'Delete proxy local-proxy' });
      await expect(freed).toBeEnabled();
      await freed.click();
      await page.getByRole('button', { name: 'Delete', exact: true }).click();
      await expect(page.getByText('No proxies configured.')).toBeVisible();
    });

    test('reports a proxy taken by another client between refresh and delete', async ({ page }) => {
      // The delete control is disabled from usage this page has already
      // fetched. Another tab, another user, or a direct API call can assign the
      // proxy after that, and nothing pushes the change here - so the refusal
      // still has to be reported rather than the click silently failing.
      await page.request.post('/api/proxies', {
        data: { label: 'shared-proxy', host: '127.0.0.1', port: 8080 },
      });
      await page.goto('/');
      await page.getByRole('button', { name: 'Create New Session', exact: true }).click();
      await page.getByText('Proxy Configuration', { exact: true }).click();

      const trash = page.getByRole('button', { name: 'Delete proxy shared-proxy' });
      await expect(trash).toBeEnabled();

      await page.request.post('/api/session/save', {
        data: { label: 'Other', mam: { mam_id: 'cookie' }, proxy: { label: 'shared-proxy' } },
      });

      // Still enabled here: this page has no way to know yet.
      await expect(trash).toBeEnabled();
      await trash.click();
      await page.getByRole('button', { name: 'Delete', exact: true }).click();

      await expect(page.getByRole('alert').filter({ hasText: 'shared-proxy' })).toContainText(
        "still used by 'Other'",
      );
      await expect(page.getByText('Host: 127.0.0.1:8080')).toBeVisible();
    });

    test('saves notification configuration without sending a notification', async ({ page }) => {
      await page.goto('/');
      await page.getByText('Notifications', { exact: true }).click();
      await page.getByText('Configuration', { exact: true }).click();
      await page
        .getByRole('textbox', { name: 'Webhook URL', exact: true })
        .fill('https://example.invalid/mousetrap-e2e');
      const saved = waitForPost(page, '/api/notify/config');
      await page.getByRole('button', { name: 'Save Settings' }).click();
      expect((await saved).ok()).toBeTruthy();

      await page.reload();
      await page.getByText('Notifications', { exact: true }).click();
      await page.getByText('Configuration', { exact: true }).click();
      await expect(page.getByRole('textbox', { name: 'Webhook URL', exact: true })).toHaveValue(
        'https://example.invalid/mousetrap-e2e',
      );
    });

    test('does not persist a failed session save', async ({ page, request }) => {
      const seeded = await request.post('/api/session/save', {
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
      expect(seeded.ok()).toBeTruthy();
      await page.goto('/');
      await page.getByText('Session Configuration', { exact: true }).click();
      await page.getByRole('textbox', { name: 'IP Address', exact: true }).fill('192.0.2.31');
      await page.route('**/api/session/save', (route) =>
        route.fulfill({ body: '{"detail":"simulated failure"}', status: 500 }),
      );
      const rejected = waitForPost(page, '/api/session/save');
      await page.getByRole('button', { name: 'SAVE', exact: true }).click();
      expect((await rejected).ok()).toBeFalsy();

      const persisted = await request.get('/api/session/FailureCase');
      expect(persisted.ok()).toBeTruthy();
      expect((await persisted.json()).mam_ip).toBe('192.0.2.30');

      await page.reload();
      await page.getByText('Session Configuration', { exact: true }).click();
      await expect(page.getByRole('textbox', { name: 'IP Address', exact: true })).toHaveValue(
        '192.0.2.30',
      );
    });
    test('shows the VIP expiry MAM reports in the MAM Details panel', async ({ page, request }) => {
      const seeded = await request.post('/api/session/save', {
        data: {
          label: 'VipDetails',
          mam: {
            ip_monitoring_mode: 'static',
            mam_id: 'e2e-mam-id',
            session_type: 'IP Locked',
          },
          mam_ip: '192.0.2.40',
        },
      });
      expect(seeded.ok()).toBeTruthy();
      // A session has no details until a check runs, so force one first.
      expect((await request.get('/api/status?label=VipDetails&force=1')).ok()).toBeTruthy();

      await page.goto('/');
      await page.getByText('MAM Details', { exact: true }).click();

      // vip_until is already in the status payload; before this row existed the
      // panel rendered twelve fields and silently dropped the VIP expiry.
      await expect(page.getByTestId('mam-details-vip-until')).toContainText('2099-01-02 03:04:05');
      await expect(page.getByTestId('mam-details-vip-until')).toContainText('left');
    });

    test('surfaces the reason MAM refused a VIP purchase in the event log', async ({
      page,
      request,
    }) => {
      const seeded = await request.post('/api/session/save', {
        data: {
          label: 'VipRefusal',
          mam: {
            ip_monitoring_mode: 'static',
            mam_id: 'e2e-mam-id',
            session_type: 'IP Locked',
          },
          mam_ip: '192.0.2.41',
        },
      });
      expect(seeded.ok()).toBeTruthy();

      await page.goto('/');
      await page.getByRole('heading', { name: 'Perk Purchase & Automation' }).click();
      const purchased = waitForPost(page, '/api/automation/vip');
      await page.getByRole('button', { name: 'Purchase VIP', exact: true }).click();
      await page.getByRole('button', { name: 'Confirm', exact: true }).click();
      expect((await purchased).ok()).toBeTruthy();

      await page.getByRole('button', { name: 'View event log', exact: true }).click();
      // Issue #145: this read only "VIP purchase failed" with the reason dropped.
      await expect(page.getByTestId('event-log-error').first()).toContainText(
        'Min VIP is 1 week purchased for Automated methods',
      );
    });
    test('disables the VIP purchase button while no full week of VIP fits', async ({
      page,
      request,
    }) => {
      const seeded = await request.post('/api/session/save', {
        data: {
          label: 'VipCapped',
          mam: {
            ip_monitoring_mode: 'static',
            mam_id: 'e2e-mam-id',
            session_type: 'IP Locked',
          },
          mam_ip: '192.0.2.42',
        },
      });
      expect(seeded.ok()).toBeTruthy();
      // The stub reports vip_until in 2099, far above the 84-day threshold.
      expect((await request.get('/api/status?label=VipCapped&force=1')).ok()).toBeTruthy();

      await page.goto('/');
      await page.getByRole('heading', { name: 'Perk Purchase & Automation' }).click();

      await expect(page.getByTestId('purchase-vip')).toBeDisabled();
      // The reason is rendered, not hover-only: a tooltip alone would leave a
      // touch user with a greyed-out button and no explanation.
      await expect(page.getByTestId('vip-purchase-blocked')).toContainText(
        /MAM refuses a purchase that would add less than a full week/,
      );
    });
  });
