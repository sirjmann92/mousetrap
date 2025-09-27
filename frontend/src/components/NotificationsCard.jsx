import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Collapse,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

export default function NotificationsCard() {
  const [showWebhook, setShowWebhook] = useState(false);
  const [showNotifyString, setShowNotifyString] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const defaultEvents = [
    { key: 'port_monitor_failure', label: 'Docker Port Monitor Failure' },
    { key: 'automation_success', label: 'Purchase Automation Success' },
    { key: 'automation_failure', label: 'Purchase Automation Failure' },
    { key: 'manual_purchase_success', label: 'Manual Purchase Success' },
    { key: 'manual_purchase_failure', label: 'Manual Purchase Failure' },
    { key: 'seedbox_update_success', label: 'Seedbox Update Success' },
    { key: 'seedbox_update_failure', label: 'Seedbox Update Failure' },
    {
      key: 'seedbox_update_rate_limited',
      label: 'Seedbox Update Rate Limited',
    },
    { key: 'asn_changed', label: 'ASN Changed' },
    { key: 'inactive_hit_and_run', label: 'Inactive Hit & Run (Not Seeding)' },
    { key: 'inactive_unsatisfied', label: 'Inactive Unsatisfied (Pre-H&R)' },
    { key: 'vault_donation_success', label: 'Vault Donation Success' },
    { key: 'vault_donation_failure', label: 'Vault Donation Failure' },
    // Add more as needed
  ];
  const [config, setConfig] = useState({
    apprise: { include_prefix: false, notify_url_string: '', url: '' },
    event_rules: {},
    smtp: {},
    webhook_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Auto-dismiss success and error messages after 2 seconds
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 2000);
      return () => clearTimeout(t);
    }
  }, [success]);
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 2000);
      return () => clearTimeout(t);
    }
  }, [error]);
  useEffect(() => {
    if (testResult) {
      const t = setTimeout(() => setTestResult(null), 2000);
      return () => clearTimeout(t);
    }
  }, [testResult]);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetch('/api/notify/config')
      .then((r) => r.json())
      .then((cfg) => {
        setConfig((prev) => ({ ...prev, ...(cfg || {}) }));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load settings');
        setLoading(false);
      });
  }, []);

  const handleChange = (field, value) => {
    setConfig((cfg) => ({ ...cfg, [field]: value }));
  };
  const handleSmtpChange = (field, value) => {
    setConfig((cfg) => ({
      ...cfg,
      smtp: { ...(cfg.smtp ?? {}), [field]: value },
    }));
  };
  const handleAppriseChange = (field, value) => {
    setConfig((cfg) => ({
      ...cfg,
      apprise: { ...(cfg.apprise || {}), [field]: value },
    }));
  };

  const handleEventRuleChange = (eventKey, channel, checked) => {
    setConfig((cfg) => {
      const rules = { ...(cfg.event_rules ?? {}) };
      const current = {
        apprise: false,
        email: false,
        webhook: false,
        ...(rules[eventKey] ?? {}),
      };
      rules[eventKey] = { ...current, [channel]: checked };
      return { ...cfg, event_rules: rules };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/notify/config', {
        body: JSON.stringify(config),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      if (!res.ok) throw new Error('Save failed');
      setSuccess('Settings saved.');
    } catch (_e) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/notify/test/webhook', {
        body: JSON.stringify({
          message: 'Test webhook from MouseTrap',
          test: true,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const data = await res.json();
      setTestResult(data.success ? 'Webhook sent!' : 'Webhook failed.');
    } catch {
      setTestResult('Webhook failed.');
    } finally {
      setTestLoading(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/notify/test/smtp', {
        body: JSON.stringify({
          body: 'This is a test email from MouseTrap.',
          subject: 'MouseTrap SMTP Test',
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const data = await res.json();
      setTestResult(data.success ? 'SMTP email sent!' : 'SMTP failed.');
    } catch {
      setTestResult('SMTP failed.');
    } finally {
      setTestLoading(false);
    }
  };

  const handleTestApprise = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/notify/test/apprise', {
        body: JSON.stringify({ test: true }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      let data = null;
      try {
        data = await res.json();
      } catch (_e) {
        data = null;
      }

      if (res.ok) {
        setTestResult(data?.success ? 'Apprise sent!' : 'Apprise failed.');
      } else {
        const detail =
          (data && (data.detail || data.message)) || (data ? JSON.stringify(data) : null);
        const status = ` (HTTP ${res.status})`;
        setTestResult(detail ? `Apprise failed${status}: ${detail}` : `Apprise failed${status}.`);
      }
    } catch {
      setTestResult('Apprise failed.');
    } finally {
      setTestLoading(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 2, mb: 3 }}>
      <Box
        onClick={() => setExpanded((e) => !e)}
        sx={{
          alignItems: 'center',
          cursor: 'pointer',
          display: 'flex',
          minHeight: 56,
          pb: 1.5,
          pt: 2,
          px: 2,
        }}
      >
        <Typography sx={{ alignItems: 'center', display: 'flex', flexGrow: 1 }} variant="h6">
          Notifications
          <Tooltip
            arrow
            title="Choose which events trigger notifications and which channels to use"
          >
            <IconButton size="small" sx={{ ml: 1, p: 0.5 }}>
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandMoreIcon sx={{ transform: 'rotate(180deg)' }} /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          <FormGroup sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {defaultEvents.map((ev) => (
                <Box
                  key={ev.key}
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography sx={{ minWidth: 220 }}>{ev.label}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!config.event_rules?.[ev.key]?.email}
                          onChange={(e) => handleEventRuleChange(ev.key, 'email', e.target.checked)}
                        />
                      }
                      disabled={!config.smtp?.host || !config.smtp?.to_email}
                      label="Email"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!config.event_rules?.[ev.key]?.webhook}
                          onChange={(e) =>
                            handleEventRuleChange(ev.key, 'webhook', e.target.checked)
                          }
                        />
                      }
                      disabled={!config.webhook_url}
                      label="Webhook"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!config.event_rules?.[ev.key]?.apprise}
                          onChange={(e) =>
                            handleEventRuleChange(ev.key, 'apprise', e.target.checked)
                          }
                        />
                      }
                      disabled={!config.apprise?.url || !config.apprise?.notify_url_string}
                      label="Apprise"
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </FormGroup>
          <Divider sx={{ my: 3 }} />
          <Typography sx={{ mt: 2 }} variant="subtitle1">
            Webhook
          </Typography>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              gap: 2,
              mb: 2,
              width: '100%',
            }}
          >
            <TextField
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label={showWebhook ? 'Hide webhook URL' : 'Show webhook URL'}
                    edge="end"
                    onClick={() => setShowWebhook((v) => !v)}
                  >
                    {showWebhook ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
              label="Webhook URL"
              onChange={(e) => handleChange('webhook_url', e.target.value)}
              size="small"
              sx={{ flex: 1, maxWidth: 600, minWidth: 350 }}
              type={showWebhook ? 'text' : 'password'}
              value={config.webhook_url || ''}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!config.discord_webhook}
                  onChange={(e) =>
                    setConfig((cfg) => ({
                      ...cfg,
                      discord_webhook: e.target.checked,
                    }))
                  }
                />
              }
              label="Discord"
              sx={{ ml: 1, mr: 1 }}
            />
            <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
              <Button
                disabled={testLoading || !config.webhook_url}
                onClick={handleTestWebhook}
                sx={{ minWidth: 80 }}
                variant="outlined"
              >
                TEST
              </Button>
            </Box>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ alignItems: 'center', display: 'flex', mb: 1 }}>
            <Typography variant="subtitle1">SMTP Email</Typography>
            <Tooltip
              arrow
              title={
                <div style={{ maxWidth: 320 }}>
                  <b>Gmail SMTP Setup:</b>
                  <br />
                  Use <b>smtp.gmail.com</b> as host.
                  <br />
                  Port <b>587</b> for TLS, <b>465</b> for SSL.
                  <br />
                  You must create an <b>App Password</b> (not your main password).
                  <br />
                  <a
                    href="https://support.google.com/mail/answer/185833?hl=en"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Create App Password
                  </a>
                  <br />
                  <a
                    href="https://support.google.com/a/answer/176600?hl=en"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    SMTP Setup Instructions
                  </a>
                </div>
              }
            >
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="SMTP Host"
              onChange={(e) => handleSmtpChange('host', e.target.value)}
              size="small"
              sx={{ maxWidth: 600, width: 350 }}
              value={config.smtp?.host || ''}
            />
            <TextField
              label="SMTP Port"
              onChange={(e) => handleSmtpChange('port', e.target.value)}
              size="small"
              sx={{ width: 120 }}
              type="number"
              value={config.smtp?.port || ''}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Username"
              onChange={(e) => handleSmtpChange('username', e.target.value)}
              size="small"
              sx={{ maxWidth: 600, width: 350 }}
              value={config.smtp?.username || ''}
            />
            <TextField
              label="Password"
              onChange={(e) => handleSmtpChange('password', e.target.value)}
              size="small"
              sx={{ width: 220 }}
              type="password"
              value={config.smtp?.password || ''}
            />
          </Box>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              gap: 2,
              mb: 2,
              width: '100%',
            }}
          >
            <TextField
              label="To Email"
              onChange={(e) => handleSmtpChange('to_email', e.target.value)}
              size="small"
              sx={{ maxWidth: 600, width: 350 }}
              value={config.smtp?.to_email || ''}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!!config.smtp?.use_tls}
                  onChange={(e) => handleSmtpChange('use_tls', e.target.checked)}
                />
              }
              label="Use TLS"
              sx={{ ml: 1, mr: 1 }}
            />
            <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
              <Button
                disabled={testLoading}
                onClick={handleTestSmtp}
                sx={{ minWidth: 80 }}
                variant="outlined"
              >
                TEST
              </Button>
            </Box>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Typography sx={{ mt: 2 }} variant="subtitle1">
            Apprise
          </Typography>
          <Box
            sx={{
              alignItems: 'flex-start',
              display: 'flex',
              gap: 2,
              mb: 2,
              width: '100%',
            }}
          >
            <TextField
              helperText="Apprise location (e.g., http://localhost:8000)."
              label="Apprise URL"
              onChange={(e) => handleAppriseChange('url', e.target.value)}
              size="small"
              sx={{ maxWidth: 600, minWidth: 350 }}
              value={config.apprise?.url || ''}
            />
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                height: 40,
                ml: 1,
                mr: 1,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!config.apprise?.include_prefix}
                    onChange={(e) => handleAppriseChange('include_prefix', e.target.checked)}
                  />
                }
                label={`Include MouseTrap prefix in title`}
                sx={{ m: 0 }}
              />
            </Box>
          </Box>
          <Box
            sx={{
              alignItems: 'flex-start',
              display: 'flex',
              gap: 2,
              mb: 2,
              width: '100%',
            }}
          >
            <TextField
              helperText={
                <>
                  Comma-separated Apprise URLs. See the &nbsp;
                  <a
                    href="https://github.com/caronc/apprise/wiki#notification-services"
                    rel="noopener noreferrer"
                    style={{
                      color: '#1976d2',
                      fontWeight: 500,
                      textDecoration: 'underline',
                    }}
                    target="_blank"
                  >
                    Apprise docs
                  </a>
                  .
                </>
              }
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label={
                      showNotifyString ? 'Hide notify URL string' : 'Show notify URL string'
                    }
                    edge="end"
                    onClick={() => setShowNotifyString((v) => !v)}
                  >
                    {showNotifyString ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
              label="Notify URL String"
              minRows={showNotifyString ? 2 : undefined}
              multiline={showNotifyString}
              onChange={(e) => handleAppriseChange('notify_url_string', e.target.value)}
              size="small"
              sx={{ maxWidth: 600, minWidth: 350 }}
              type={showNotifyString ? 'text' : 'password'}
              value={config.apprise?.notify_url_string || ''}
            />
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flex: 1,
                height: 40,
                justifyContent: 'flex-end',
              }}
            >
              <Button
                disabled={testLoading || !config.apprise?.url || !config.apprise?.notify_url_string}
                onClick={handleTestApprise}
                sx={{ minWidth: 80 }}
                variant="outlined"
              >
                TEST
              </Button>
            </Box>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button disabled={saving} onClick={handleSave} variant="contained">
              Save Settings
            </Button>
          </Box>
          {testResult && (
            <Alert severity={testResult.includes('failed') ? 'error' : 'success'} sx={{ mt: 2 }}>
              {testResult}
            </Alert>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
}
