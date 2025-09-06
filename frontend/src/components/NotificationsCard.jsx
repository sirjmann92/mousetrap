
import React, { useEffect, useState } from "react";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Box, Card, CardContent, Typography, TextField, Button, Switch, FormControlLabel, Divider, Alert, CircularProgress, Checkbox, FormGroup, Tooltip, IconButton, Collapse } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function NotificationsCard() {
  const [showWebhook, setShowWebhook] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const defaultEvents = [
    { key: "port_monitor_failure", label: "Docker Port Monitor Failure" },
    { key: "automation_success", label: "Purchase Automation Success" },
    { key: "automation_failure", label: "Purchase Automation Failure" },
    { key: "manual_purchase_success", label: "Manual Purchase Success" },
    { key: "manual_purchase_failure", label: "Manual Purchase Failure" },
    { key: "seedbox_update_success", label: "Seedbox Update Success" },
    { key: "seedbox_update_failure", label: "Seedbox Update Failure" },
    { key: "seedbox_update_rate_limited", label: "Seedbox Update Rate Limited" },
    { key: "asn_changed", label: "ASN Changed" },
    { key: "inactive_hit_and_run", label: "Hit & Run - Inactive (Not Seeding)" },
    { key: "inactive_unsatisfied", label: "Inactive Unsatisfied (Pre-H&R)" },
    { key: "vault_donation_success", label: "Vault Donation Success" },
    { key: "vault_donation_failure", label: "Vault Donation Failure" },
    // Add more as needed
  ];
  const [config, setConfig] = useState({ webhook_url: "", smtp: {}, event_rules: {} });
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
    fetch("/api/notify/config")
      .then(r => r.json())
      .then(cfg => { setConfig(cfg || {}); setLoading(false); })
      .catch(e => { setError("Failed to load settings"); setLoading(false); });
  }, []);

  const handleChange = (field, value) => {
    setConfig(cfg => ({ ...cfg, [field]: value }));
  };
  const handleSmtpChange = (field, value) => {
    setConfig(cfg => ({ ...cfg, smtp: { ...cfg.smtp, [field]: value } }));
  };

  const handleEventRuleChange = (eventKey, channel, checked) => {
    setConfig(cfg => {
      const rules = { ...cfg.event_rules };
      if (!rules[eventKey]) rules[eventKey] = { email: false, webhook: false };
      rules[eventKey][channel] = checked;
      return { ...cfg, event_rules: rules };
    });
  };

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(null);
    try {
      const res = await fetch("/api/notify/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (!res.ok) throw new Error("Save failed");
      setSuccess("Settings saved.");
    } catch (e) {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    setTestLoading(true); setTestResult(null);
    try {
      const res = await fetch("/api/notify/test/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true, message: "Test webhook from MouseTrap" })
      });
      const data = await res.json();
      setTestResult(data.success ? "Webhook sent!" : "Webhook failed.");
    } catch {
      setTestResult("Webhook failed.");
    } finally {
      setTestLoading(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestLoading(true); setTestResult(null);
    try {
      const res = await fetch("/api/notify/test/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: "MouseTrap SMTP Test", body: "This is a test email from MouseTrap." })
      });
      const data = await res.json();
      setTestResult(data.success ? "SMTP email sent!" : "SMTP failed.");
    } catch {
      setTestResult("SMTP failed.");
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) return <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', px: 2, pt: 2, pb: 1.5, minHeight: 56 }} onClick={() => setExpanded(e => !e)}>
        <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          Notifications
          <Tooltip title="Choose which events trigger notifications and which channels to use" arrow>
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
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <FormGroup sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {defaultEvents.map(ev => (
                <Box key={ev.key} sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                  <Typography sx={{ minWidth: 220 }}>{ev.label}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                    <FormControlLabel
                      control={<Checkbox
                        checked={!!config.event_rules?.[ev.key]?.email}
                        onChange={e => handleEventRuleChange(ev.key, 'email', e.target.checked)}
                      />}
                      label="Email"
                    />
                    <FormControlLabel
                      control={<Checkbox
                        checked={!!config.event_rules?.[ev.key]?.webhook}
                        onChange={e => handleEventRuleChange(ev.key, 'webhook', e.target.checked)}
                      />}
                      label="Webhook"
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </FormGroup>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Webhook</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, width: '100%' }}>
            <TextField
              label="Webhook URL"
              value={
                showWebhook
                  ? (config.webhook_url || "")
                  : (config.webhook_url ? `********${config.webhook_url.slice(-6)}` : "")
              }
              onChange={e => handleChange("webhook_url", e.target.value)}
              size="small"
              sx={{ flex: 1, minWidth: 350, maxWidth: 600 }}
              type={showWebhook ? "text" : "password"}
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label={showWebhook ? "Hide webhook URL" : "Show webhook URL"}
                    onClick={() => setShowWebhook(v => !v)}
                    edge="end"
                  >
                    {showWebhook ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
            <FormControlLabel
              control={<Checkbox
                checked={!!config.discord_webhook}
                onChange={e => setConfig(cfg => ({ ...cfg, discord_webhook: e.target.checked }))}
              />}
              label="Discord"
              sx={{ ml: 1, mr: 1 }}
            />
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={handleTestWebhook} disabled={testLoading || !config.webhook_url} sx={{ minWidth: 80 }}>
                TEST
              </Button>
            </Box>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">SMTP Email</Typography>
            <Tooltip
              title={<>
                <div style={{ maxWidth: 320 }}>
                  <b>Gmail SMTP Setup:</b><br/>
                  Use <b>smtp.gmail.com</b> as host.<br/>
                  Port <b>587</b> for TLS, <b>465</b> for SSL.<br/>
                  You must create an <b>App Password</b> (not your main password).<br/>
                  <a href="https://support.google.com/mail/answer/185833?hl=en" target="_blank" rel="noopener noreferrer">Create App Password</a><br/>
                  <a href="https://support.google.com/a/answer/176600?hl=en" target="_blank" rel="noopener noreferrer">SMTP Setup Instructions</a>
                </div>
              </>}
              arrow
            >
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="SMTP Host"
              value={config.smtp?.host || ""}
              onChange={e => handleSmtpChange("host", e.target.value)}
              size="small"
              sx={{ width: 350, maxWidth: 600 }}
            />
            <TextField
              label="SMTP Port"
              type="number"
              value={config.smtp?.port || ""}
              onChange={e => handleSmtpChange("port", e.target.value)}
              size="small"
              sx={{ width: 120 }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Username"
              value={config.smtp?.username || ""}
              onChange={e => handleSmtpChange("username", e.target.value)}
              size="small"
              sx={{ width: 350, maxWidth: 600 }}
            />
            <TextField
              label="Password"
              type="password"
              value={config.smtp?.password || ""}
              onChange={e => handleSmtpChange("password", e.target.value)}
              size="small"
              sx={{ width: 220 }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, width: '100%' }}>
            <TextField
              label="To Email"
              value={config.smtp?.to_email || ""}
              onChange={e => handleSmtpChange("to_email", e.target.value)}
              size="small"
              sx={{ width: 350, maxWidth: 600 }}
            />
            <FormControlLabel
              control={<Switch checked={!!config.smtp?.use_tls} onChange={e => handleSmtpChange("use_tls", e.target.checked)} />}
              label="Use TLS"
              sx={{ ml: 1, mr: 1 }}
            />
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={handleTestSmtp} disabled={testLoading} sx={{ minWidth: 80 }}>
                TEST
              </Button>
            </Box>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              Save Settings
            </Button>
          </Box>
          {testResult && <Alert severity={testResult.includes("failed") ? "error" : "success"} sx={{ mt: 2 }}>{testResult}</Alert>}
        </CardContent>
      </Collapse>
    </Card>
  );
}