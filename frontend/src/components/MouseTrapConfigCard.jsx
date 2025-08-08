import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Alert,
  IconButton,
  Collapse,
  Tooltip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Snackbar from '@mui/material/Snackbar';
import PropTypes from 'prop-types';

export default function MouseTrapConfigCard({
  mamId, setMamId,
  sessionType, setSessionType,
  mamIp, setMamIp,
  detectedIp,
  currentASN,
  checkFrequency, setCheckFrequency,
  label, setLabel,
  oldLabel,
  onSessionSaved,
  proxy = {}, setProxy
}) {
  // New: Local state for save status
  const [saveStatus, setSaveStatus] = useState("");
  const [saveError, setSaveError] = useState("");
  const [expanded, setExpanded] = useState(false);
  // Proxy config state
  const [proxyHost, setProxyHost] = useState(proxy.host || "");
  const [proxyPort, setProxyPort] = useState(proxy.port || "");
  const [proxyUsername, setProxyUsername] = useState(proxy.username || "");
  // Track if a password is set (from backend)
  const [proxyPassword, setProxyPassword] = useState(""); // blank unless user enters new
  const [hasPassword, setHasPassword] = useState(!!proxy.password);

  // Validation state
  const [labelError, setLabelError] = useState("");

  useEffect(() => {
    setProxyHost(proxy.host || "");
    setProxyPort(proxy.port || "");
    setProxyUsername(proxy.username || "");
    setProxyPassword("");
    setHasPassword(!!proxy.password);
  }, [proxy]);

  // Validation logic
  useEffect(() => {
    setLabelError(!label || label.trim() === "" ? "Session label is required." : "");
  }, [label]);

  const sessionTypeError = !sessionType || sessionType === "" ? "Required" : "";
  const freqError = !checkFrequency || checkFrequency === "" || isNaN(checkFrequency) || checkFrequency < 1 ? "Required" : "";
  const mamIdError = !mamId || mamId.trim() === "";
  const ipError = !mamIp || mamIp.trim() === "";

  const allValid = !labelError && !mamIdError && !sessionTypeError && !ipError && !freqError;

  // Save config handler
  const handleSave = async () => {
    setSaveStatus("");
    setSaveError("");
    if (!allValid) return;
    const payload = {
      label,
      old_label: oldLabel,
      mam: {
        mam_id: mamId,
        session_type: sessionType
      },
      mam_ip: mamIp,
      check_freq: checkFrequency,
      proxy: {
        host: proxyHost,
        port: proxyPort ? Number(proxyPort) : 0,
        username: proxyUsername,
        // Only send password if user entered a new one
        ...(proxyPassword ? { password: proxyPassword } : {})
      }
    };
    try {
      const res = await fetch("/api/session/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save session");
      setSaveStatus("Session saved successfully.");
      setTimeout(() => setSaveStatus(""), 2000);
      if (onSessionSaved) onSessionSaved(label, oldLabel);
      if (setProxy) setProxy(payload.proxy);
    } catch (err) {
      setSaveError("Error saving session: " + err.message);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      {/* Snackbar for save status */}
      <Snackbar
        open={!!saveStatus || !!saveError}
        autoHideDuration={3000}
        onClose={() => { setSaveStatus(""); setSaveError(""); }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {saveStatus ? (
          <Alert severity="success" sx={{ width: '100%' }}>{saveStatus}</Alert>
        ) : saveError ? (
          <Alert severity="error" sx={{ width: '100%' }}>{saveError}</Alert>
        ) : null}
      </Snackbar>
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', px: 2, pt: 2, pb: 1.5, minHeight: 56 }} onClick={() => setExpanded(e => !e)}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Session Configuration
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <TextField
                label="Session Label"
                value={label}
                onChange={e => setLabel(e.target.value)}
                size="small"
                required
                helperText="Unique name for this session (required)"
                sx={{ width: 300 }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <TextField
                label="MAM ID"
                value={mamId}
                onChange={e => setMamId(e.target.value)}
                size="small"
                required
                error={mamIdError}
                inputProps={{ maxLength: 300 }}
                multiline
                minRows={2}
                maxRows={4}
                helperText="Paste your full MAM ID here (required)"
                sx={{ width: 300 }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  label="IP Address"
                  value={mamIp}
                  onChange={e => setMamIp(e.target.value)}
                  size="small"
                  required
                  error={ipError}
                  inputProps={{ maxLength: 16 }}
                  placeholder="e.g. 203.0.113.99"
                  helperText="Enter IP address associated with MAM ID"
                  sx={{ width: 300 }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setMamIp(detectedIp)}
                    sx={{ height: 40 }}
                    disabled={!detectedIp}
                  >
                    Use Detected IP
                  </Button>
                  <Typography variant="caption" sx={{ mt: 0.5 }} color="text.secondary">
                    {detectedIp ? detectedIp : 'No IP detected'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          {/* Session Type and Frequency row */}
          <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 160, maxWidth: 190, flex: 2 }} error={!!sessionTypeError}>
                  <InputLabel>Session Type*</InputLabel>
                  <Select
                    value={sessionType || ""}
                    label="Session Type*"
                    onChange={e => setSessionType(e.target.value)}
                  >
                    <MenuItem value="">Select...</MenuItem>
                    <MenuItem value="IP Locked">IP Locked</MenuItem>
                    <MenuItem value="ASN Locked">ASN Locked</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120, maxWidth: 165, flex: 1 }} error={!!freqError}>
                  <InputLabel>Frequency*</InputLabel>
                  <Select
                    value={checkFrequency || ""}
                    label="Frequency*"
                    onChange={e => setCheckFrequency(Number(e.target.value))}
                  >
                    <MenuItem value="">Select...</MenuItem>
                    {Array.from({ length: 60 }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Tooltip title="How often to check and update IP/ASN (minutes)" arrow>
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
          {/* Divider and VPN Proxy Configuration label */}
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>VPN Proxy Configuration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Proxy Host/Port row */}
              <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      label="Proxy Host"
                      value={proxyHost}
                      onChange={e => setProxyHost(e.target.value)}
                      size="small"
                      placeholder="proxy.example.com"
                      sx={{ width: 180 }}
                    />
                    <TextField
                      label="Port"
                      value={proxyPort}
                      onChange={e => setProxyPort(e.target.value.replace(/[^0-9]/g, ''))}
                      size="small"
                      placeholder="8080"
                      sx={{ width: 90 }}
                      inputProps={{ maxLength: 5 }}
                    />
                  </Box>
                </Grid>
              </Grid>
              {/* Username/Password row */}
              <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      label="Username"
                      value={proxyUsername}
                      onChange={e => setProxyUsername(e.target.value)}
                      size="small"
                      placeholder="user"
                      sx={{ width: 140 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        label="Password"
                        value={proxyPassword}
                        onChange={e => setProxyPassword(e.target.value)}
                        size="small"
                        placeholder={hasPassword ? "(password set)" : ""}
                        type="password"
                        sx={{ width: 140 }}
                        autoComplete="new-password"
                      />
                      {hasPassword && !proxyPassword && (
                        <Tooltip title="Leave blank to keep existing password">
                          <IconButton size="small" sx={{ ml: 0.5 }}>
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Box sx={{ textAlign: "right", mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSave} disabled={!allValid}>
              SAVE
            </Button>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
}

MouseTrapConfigCard.propTypes = {
  mamId: PropTypes.string,
  setMamId: PropTypes.func,
  sessionType: PropTypes.string,
  setSessionType: PropTypes.func,
  mamIp: PropTypes.string,
  setMamIp: PropTypes.func,
  detectedIp: PropTypes.string,
  currentASN: PropTypes.string,
  checkFrequency: PropTypes.number,
  setCheckFrequency: PropTypes.func,
  label: PropTypes.string,
  setLabel: PropTypes.func,
  oldLabel: PropTypes.string,
  onSessionSaved: PropTypes.func,
  proxy: PropTypes.shape({
    host: PropTypes.string,
    port: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
    password: PropTypes.string
  }),
  setProxy: PropTypes.func
};

MouseTrapConfigCard.defaultProps = {
  proxy: {},
  setProxy: () => {}
};
