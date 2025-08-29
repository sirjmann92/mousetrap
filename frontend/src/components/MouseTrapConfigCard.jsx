import React, { useEffect, useState } from "react";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
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

import { useSession } from '../context/SessionContext';

export default function MouseTrapConfigCard({
  proxies = {},
  onProxiesChanged,
  onSessionSaved,
  hasSessions = true,
  onCreateNewSession,
  forceExpand = false,
  onForceExpandHandled = () => {}
}) {
  const {
    detectedIp,
    sessionLabel,
    setSessionLabel,
    mamId, setMamId,
    sessionType, setSessionType,
    mamIp, setMamIp,
    checkFrequency, setCheckFrequency,
    oldLabel, setOldLabel,
    proxy, setProxy,
    proxiedIp, proxiedAsn,
    browserCookie, setBrowserCookie
  } = useSession();

  // Local state for editing label
  const [label, setLabel] = useState(sessionLabel || "");

  // Keep local label in sync when session changes
  useEffect(() => {
    setLabel(sessionLabel || "");
  }, [sessionLabel]);
  // New: Local state for save status
  const [saveStatus, setSaveStatus] = useState("");
  const [saveError, setSaveError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [showMamId, setShowMamId] = useState(false);

  // Expand the card if forceExpand becomes true
  useEffect(() => {
    if (forceExpand) {
      setExpanded(true);
      onForceExpandHandled();
    }
  }, [forceExpand, onForceExpandHandled]);
  // Proxy config state
  // Proxy selection state
  const [proxyLabel, setProxyLabel] = useState("");
  // proxies now comes from props
  // proxyStatus.ip will now be the actual proxied public IP (not the proxy server's host)
  const [proxyStatus, setProxyStatus] = useState({ ip: "", asn: "", valid: false });
  // Local state for immediate proxy test result
  const [localProxiedIp, setLocalProxiedIp] = useState("");

  // Validation state
  const [labelError, setLabelError] = useState("");

  useEffect(() => {
    setProxyLabel(proxy?.label || "");
  }, [proxy]);

  // When proxyLabel changes, trigger backend detection for proxy IP/ASN
  useEffect(() => {
    if (!proxyLabel) {
      setProxyStatus({ ip: "", asn: "", valid: false });
      setLocalProxiedIp("");
      return;
    }
    // When a proxy is selected, immediately check its public IP (without requiring save)
    fetch(`/api/proxy_test/${encodeURIComponent(proxyLabel)}`)
      .then(res => res.json())
      .then(status => {
        if (status && status.proxied_ip) {
          setProxyStatus({ ip: status.proxied_ip, asn: status.proxied_asn || "", valid: true });
          setLocalProxiedIp(status.proxied_ip);
        } else {
          setProxyStatus({ ip: "", asn: "", valid: false });
          setLocalProxiedIp("");
        }
      })
      .catch(() => {
        setProxyStatus({ ip: "", asn: "", valid: false });
        setLocalProxiedIp("");
      });
  }, [proxyLabel]);




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
    // Only update global sessionLabel on save
    setSessionLabel(label);
    const payload = {
      label,
      old_label: oldLabel,
      mam: {
        mam_id: mamId,
        session_type: sessionType
      },
      mam_ip: mamIp,
      check_freq: checkFrequency,
      browser_cookie: browserCookie,
      proxy: { label: proxyLabel }
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

  if (!hasSessions) {
    // Show only CTA banner and button
    return (
      <Card sx={{ mb: 3, borderRadius: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
        <Box sx={{ width: '100%', mb: 2 }}>
          <Alert severity="info" sx={{ fontSize: 17, py: 2, px: 3, textAlign: 'center' }}>
            Create a new session to get started.
          </Alert>
        </Box>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 1, px: 4, py: 1.5, fontSize: 18, fontWeight: 600, borderRadius: 2 }}
          onClick={onCreateNewSession}
        >
          Create New Session
        </Button>
      </Card>
    );
  }

  // Restore the full config form rendering
  return (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
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
            <Grid item xs={4} sm={4} md={3} lg={3} xl={2}>
              <TextField
                label="Session Label"
                value={label}
                onChange={e => setLabel(e.target.value)}
                size="small"
                required
                sx={{ width: 145 }}
              />
            </Grid>
            <Grid item xs={4} sm={4} md={3} lg={3} xl={2}>
              <FormControl size="small" sx={{ minWidth: 130, maxWidth: 175 }} error={!!sessionTypeError}>
                <InputLabel required error={!!sessionTypeError} sx={{ color: !!sessionTypeError ? 'error.main' : undefined }}>
                  Session Type
                </InputLabel>
                <Select
                  value={sessionType || ""}
                  label="Session Type*"
                  onChange={e => setSessionType(e.target.value)}
                  error={!!sessionTypeError}
                  sx={{ minWidth: 150, maxWidth: 195 }}
                  MenuProps={{ disableScrollLock: true }}
                >
                  <MenuItem value="">Select...</MenuItem>
                  <MenuItem value="IP Locked">IP Locked</MenuItem>
                  <MenuItem value="ASN Locked">ASN Locked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4} sm={4} md={3} lg={3} xl={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 120, maxWidth: 165 }} error={!!freqError}>
                  <InputLabel>Interval*</InputLabel>
                  <Select
                    value={checkFrequency || ""}
                    label="Interval*"
                    onChange={e => setCheckFrequency(Number(e.target.value))}
                    sx={{ minWidth: 100, maxWidth: 145 }}
                    MenuProps={{ disableScrollLock: true }}
                  >
                    <MenuItem value="">Select...</MenuItem>
                    <MenuItem value={1}>1</MenuItem>
                    {[5,10,15,20,25,30,35,40,45,50,55,60].map(val => (
                      <MenuItem key={val} value={val}>{val}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Tooltip title="How often to check the IP/ASN for changes" arrow>
                  <IconButton size="small" sx={{ ml: 0.5 }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <TextField
                label="MAM ID"
                value={
                  showMamId
                    ? mamId
                    : mamId
                      ? `********${mamId.slice(-6)}`
                      : ""
                }
                onChange={e => setMamId(e.target.value)}
                size="small"
                required
                error={mamIdError}
                inputProps={{ maxLength: 300 }}
                multiline
                minRows={2}
                maxRows={6}
                helperText="Paste your full MAM ID here (required)"
                sx={{ width: { xs: '100%', sm: 400, md: 450 } }}
                type={showMamId ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      aria-label={showMamId ? "Hide MAM ID" : "Show MAM ID"}
                      onClick={() => setShowMamId(v => !v)}
                      edge="end"
                    >
                      {showMamId ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  )
                }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  {/* <TextField
                    label="Browser Cookie (optional)"
                    value={browserCookie}
                    onChange={e => setBrowserCookie(e.target.value)}
                    size="small"
                    multiline
                    minRows={2}
                    maxRows={6}
                    sx={{ width: { xs: '100%', sm: 400, md: 450 } }}
                    placeholder="Paste full browser cookie string here"
                    helperText="Paste the full browser cookie string for this session."
                  />
                  <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>Open your browser's DevTools (F12), go to the Application/Storage tab, find the 'cookie' for myanonamouse.net, and copy the full value. Paste it here.</span>} arrow>
                    <IconButton size="small" sx={{ mt: 1 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip> */}
              </Box>
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
                  helperText="IP to associate with MAM ID"
                  sx={{ width: 205 }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setMamIp(detectedIp)}
                    sx={{ height: 40, mb: 0.2, minWidth: 120 }}
                    disabled={!detectedIp}
                  >
                    USE DETECTED IP
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.2 }}>
                    {detectedIp || 'No IP detected'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    onClick={() => setMamIp(localProxiedIp)}
                    sx={{ height: 40, mb: 0.2, minWidth: 120 }}
                    disabled={!localProxiedIp}
                  >
                    USE PROXY IP
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.2 }}>
                    {localProxiedIp || 'No proxy IP detected'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <FormControl size="small" sx={{ minWidth: 260, maxWidth: 320 }}>
                  <InputLabel>Proxy</InputLabel>
                  <Select
                    value={proxyLabel}
                    label="Proxy"
                    onChange={e => setProxyLabel(e.target.value)}
                    sx={{ minWidth: 260, maxWidth: 320 }}
                    MenuProps={{
                      PaperProps: {
                        style: { minWidth: 260, maxWidth: 320 },
                      },
                      disableScrollLock: true
                    }}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {Object.keys(proxies).map(label => (
                      <MenuItem key={label} value={label} style={{ whiteSpace: 'normal' }}>{label} ({proxies[label].host}:{proxies[label].port})</MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" color="text.secondary" sx={{ pl: 1, pt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Select a proxy to use for this session (optional)
                  </Typography>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: "right", mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSave} disabled={!allValid || !sessionType}>
              SAVE
            </Button>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
}

MouseTrapConfigCard.propTypes = {
  onSessionSaved: PropTypes.func,
  hasSessions: PropTypes.bool,
  onCreateNewSession: PropTypes.func,
  forceExpand: PropTypes.bool,
  onForceExpandHandled: PropTypes.func
};

MouseTrapConfigCard.defaultProps = {
  hasSessions: true,
  onCreateNewSession: () => {},
  forceExpand: false,
  onForceExpandHandled: () => {}
};
