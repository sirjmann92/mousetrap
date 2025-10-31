import EmailIcon from '@mui/icons-material/Email';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WebhookIcon from '@mui/icons-material/Webhook';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  InputAdornment,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

// Font Awesome icon wrapper component (keeping for Apprise since it doesn't have an official logo)
const FontAwesomeIcon = ({ icon, color, fontSize = 20 }) => (
  <i className={icon} style={{ color, fontSize }} />
);

// Gmail icon SVG from Wikimedia Commons
const GmailIcon = ({ size = 20 }) => (
  <svg
    aria-label="Gmail"
    height={size}
    role="img"
    style={{ display: 'block' }}
    viewBox="0 0 24 24"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.366l8.073-5.873C21.69 2.28 24 3.434 24 5.457z"
      fill="#4285F4"
    />
    <path
      d="M0 5.457v.727l12 8.727 12-8.727v-.727c0-2.023-2.309-3.178-3.927-1.964L12 9.366 3.927 3.493C2.309 2.28 0 3.434 0 5.457z"
      fill="#34A853"
    />
    <path d="M0 6.182v13.184c0 .904.732 1.636 1.636 1.636h3.819V11.729L0 6.182z" fill="#EA4335" />
    <path
      d="M24 6.182v13.184c0 .904-.732 1.636-1.636 1.636h-3.819V11.729L24 6.182z"
      fill="#FBBC04"
    />
  </svg>
);

// Discord icon SVG from Wikimedia Commons
const DiscordIcon = ({ size = 20 }) => (
  <svg
    aria-label="Discord"
    height={size}
    role="img"
    style={{ display: 'block' }}
    viewBox="0 0 127.14 96.36"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
      fill="#5865F2"
    />
  </svg>
);

export default function NotificationsCard() {
  const [showWebhook, setShowWebhook] = useState(false);
  const [showNotifyString, setShowNotifyString] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [configExpanded, setConfigExpanded] = useState(false);

  // Event groups with success/failure pairs
  const pairedEvents = [
    {
      baseKey: 'automation',
      label: 'Purchase Automation',
      successKey: 'automation_success',
      failureKey: 'automation_failure',
    },
    {
      baseKey: 'manual_purchase',
      label: 'Manual Purchase',
      successKey: 'manual_purchase_success',
      failureKey: 'manual_purchase_failure',
    },
    {
      baseKey: 'seedbox_update',
      label: 'Seedbox Update',
      successKey: 'seedbox_update_success',
      failureKey: 'seedbox_update_failure',
    },
  ];

  // Unique events (no success/failure pair)
  const uniqueEvents = [
    { key: 'port_monitor_failure', label: 'Docker Port Monitor Failure' },
    { key: 'seedbox_update_rate_limited', label: 'Seedbox Update Rate Limited' },
    {
      key: 'inactive_hit_and_run',
      label: 'Inactive Hit & Run',
      tooltip: 'Not Seeding',
    },
    {
      key: 'inactive_unsatisfied',
      label: 'Inactive Unsatisfied',
      tooltip: 'Pre-H&R',
    },
    { key: 'mam_session_expiry', label: 'MAM Session Expiry Warning' },
  ];
  const [config, setConfig] = useState({
    apprise: { include_prefix: false, notify_url_string: '', url: '' },
    event_rules: {},
    smtp: {},
    webhook_url: '',
    discord_webhook: false,
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

  // Helper to get configured notification methods
  const getConfiguredMethods = () => {
    const methods = [];
    // Check if webhook is configured
    if (config.webhook_url) {
      methods.push(config.discord_webhook ? 'Discord' : 'Webhook');
    }
    // Check if SMTP is configured (needs host and to_email at minimum)
    if (config.smtp?.host && config.smtp?.to_email) {
      methods.push('Email');
    }
    // Check if Apprise is configured
    if (config.apprise?.url) {
      methods.push('Apprise');
    }
    return methods;
  };

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
      apprise: {
        include_prefix: cfg.apprise?.include_prefix ?? false,
        notify_url_string: cfg.apprise?.notify_url_string ?? '',
        url: cfg.apprise?.url ?? '',
        [field]: value,
      },
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
        onClick={() => setExpanded(!expanded)}
        sx={{
          alignItems: 'center',
          cursor: 'pointer',
          display: 'flex',
          pb: 1.5,
          pt: 2,
          px: 2,
        }}
      >
        <Typography sx={{ flexGrow: 1 }} variant="h6">
          Notifications
        </Typography>
        {getConfiguredMethods().length > 0 && (
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, mr: 1 }}>
            {getConfiguredMethods().map((method) => {
              let icon = null;
              let tooltip = '';

              if (method === 'Discord') {
                icon = <DiscordIcon size={20} />;
                tooltip = 'Discord Webhook Configured';
              } else if (method === 'Webhook') {
                icon = <WebhookIcon sx={{ color: '#FF6B6B', fontSize: 20 }} />;
                tooltip = 'Webhook Configured';
              } else if (method === 'Email') {
                // Check if it's Gmail - use official Gmail icon with colors
                const isGmail = config.smtp?.host?.toLowerCase().includes('gmail');
                if (isGmail) {
                  icon = <GmailIcon size={20} />;
                  tooltip = 'Gmail SMTP Configured';
                } else {
                  icon = <EmailIcon sx={{ color: '#4285F4', fontSize: 20 }} />;
                  tooltip = 'SMTP Email Configured';
                }
              } else if (method === 'Apprise') {
                // Apprise doesn't have an official logo, use Font Awesome bullhorn
                icon = <FontAwesomeIcon color="#FFA726" icon="fa-solid fa-bullhorn" />;
                tooltip = 'Apprise Configured';
              }

              return (
                <Tooltip arrow key={method} title={tooltip}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfigExpanded(true);
                      setExpanded(true);
                    }}
                    size="small"
                    sx={{ p: 0.5 }}
                  >
                    {icon}
                  </IconButton>
                </Tooltip>
              );
            })}
          </Box>
        )}
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Paired Events (Success/Failure) */}
              {pairedEvents.map((group) => (
                <Box
                  key={group.baseKey}
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography sx={{ minWidth: 180 }}>{group.label}</Typography>

                  {/* Success/Failure Checkboxes */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!config.event_rules?.[group.successKey]?.enabled}
                          onChange={(e) =>
                            handleEventRuleChange(group.successKey, 'enabled', e.target.checked)
                          }
                        />
                      }
                      label="Success"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!config.event_rules?.[group.failureKey]?.enabled}
                          onChange={(e) =>
                            handleEventRuleChange(group.failureKey, 'enabled', e.target.checked)
                          }
                        />
                      }
                      label="Failure"
                    />
                  </Box>

                  {/* Notification Method Checkboxes */}
                  <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            (!!config.event_rules?.[group.successKey]?.email &&
                              !!config.event_rules?.[group.successKey]?.enabled) ||
                            (!!config.event_rules?.[group.failureKey]?.email &&
                              !!config.event_rules?.[group.failureKey]?.enabled)
                          }
                          indeterminate={
                            (!!config.event_rules?.[group.successKey]?.email &&
                              !!config.event_rules?.[group.successKey]?.enabled) !==
                            (!!config.event_rules?.[group.failureKey]?.email &&
                              !!config.event_rules?.[group.failureKey]?.enabled)
                          }
                          onChange={(e) => {
                            if (config.event_rules?.[group.successKey]?.enabled) {
                              handleEventRuleChange(group.successKey, 'email', e.target.checked);
                            }
                            if (config.event_rules?.[group.failureKey]?.enabled) {
                              handleEventRuleChange(group.failureKey, 'email', e.target.checked);
                            }
                          }}
                        />
                      }
                      disabled={!config.smtp?.host || !config.smtp?.to_email}
                      label="Email"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            (!!config.event_rules?.[group.successKey]?.webhook &&
                              !!config.event_rules?.[group.successKey]?.enabled) ||
                            (!!config.event_rules?.[group.failureKey]?.webhook &&
                              !!config.event_rules?.[group.failureKey]?.enabled)
                          }
                          indeterminate={
                            (!!config.event_rules?.[group.successKey]?.webhook &&
                              !!config.event_rules?.[group.successKey]?.enabled) !==
                            (!!config.event_rules?.[group.failureKey]?.webhook &&
                              !!config.event_rules?.[group.failureKey]?.enabled)
                          }
                          onChange={(e) => {
                            if (config.event_rules?.[group.successKey]?.enabled) {
                              handleEventRuleChange(group.successKey, 'webhook', e.target.checked);
                            }
                            if (config.event_rules?.[group.failureKey]?.enabled) {
                              handleEventRuleChange(group.failureKey, 'webhook', e.target.checked);
                            }
                          }}
                        />
                      }
                      disabled={!config.webhook_url}
                      label="Webhook"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            (!!config.event_rules?.[group.successKey]?.apprise &&
                              !!config.event_rules?.[group.successKey]?.enabled) ||
                            (!!config.event_rules?.[group.failureKey]?.apprise &&
                              !!config.event_rules?.[group.failureKey]?.enabled)
                          }
                          indeterminate={
                            (!!config.event_rules?.[group.successKey]?.apprise &&
                              !!config.event_rules?.[group.successKey]?.enabled) !==
                            (!!config.event_rules?.[group.failureKey]?.apprise &&
                              !!config.event_rules?.[group.failureKey]?.enabled)
                          }
                          onChange={(e) => {
                            if (config.event_rules?.[group.successKey]?.enabled) {
                              handleEventRuleChange(group.successKey, 'apprise', e.target.checked);
                            }
                            if (config.event_rules?.[group.failureKey]?.enabled) {
                              handleEventRuleChange(group.failureKey, 'apprise', e.target.checked);
                            }
                          }}
                        />
                      }
                      disabled={!config.apprise?.url || !config.apprise?.notify_url_string}
                      label="Apprise"
                    />
                  </Box>
                </Box>
              ))}

              {/* Divider between paired and unique events */}
              <Divider sx={{ my: 1 }} />

              {/* Unique Events */}
              {uniqueEvents.map((ev) => (
                <Box
                  key={ev.key}
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, minWidth: 180 }}>
                    <Typography>{ev.label}</Typography>
                    {ev.tooltip && (
                      <Tooltip arrow placement="top" title={ev.tooltip}>
                        <IconButton size="small" sx={{ ml: 0.5, p: 0.25 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  {/* No Success/Failure checkboxes for unique events - just spacing */}
                  <Box sx={{ display: 'flex', gap: 1, width: 180 }} />

                  {/* Notification Method Checkboxes */}
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

          <Accordion
            expanded={configExpanded}
            onChange={(_e, isExpanded) => setConfigExpanded(isExpanded)}
            sx={{
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5'),
              borderRadius: 2,
              mb: 3,
              overflow: 'hidden',
            }}
          >
            <AccordionSummary
              aria-controls="config-content"
              expandIcon={<ExpandMoreIcon />}
              id="config-header"
              sx={{
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5'),
              }}
            >
              <Typography sx={{ fontWeight: 600 }} variant="subtitle2">
                Configuration
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5'),
              }}
            >
              <Typography variant="subtitle1">Webhook</Typography>
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
                  label="Webhook URL"
                  onChange={(e) => handleChange('webhook_url', e.target.value)}
                  size="small"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showWebhook ? 'Hide webhook URL' : 'Show webhook URL'}
                            edge="end"
                            onClick={() => setShowWebhook((v) => !v)}
                          >
                            {showWebhook ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
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
                  label="Notify URL String"
                  minRows={showNotifyString ? 2 : undefined}
                  multiline={showNotifyString}
                  onChange={(e) => handleAppriseChange('notify_url_string', e.target.value)}
                  size="small"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showNotifyString ? 'Hide notify URL string' : 'Show notify URL string'
                            }
                            edge="end"
                            onClick={() => setShowNotifyString((v) => !v)}
                          >
                            {showNotifyString ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
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
                    disabled={
                      testLoading || !config.apprise?.url || !config.apprise?.notify_url_string
                    }
                    onClick={handleTestApprise}
                    sx={{ minWidth: 80 }}
                    variant="outlined"
                  >
                    TEST
                  </Button>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

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
