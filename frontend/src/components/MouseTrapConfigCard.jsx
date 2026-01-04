import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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
  Collapse,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import { useSession } from '../context/SessionContext.jsx';
import IndexerIntegrations from './IndexerIntegrations.jsx';

export default function MouseTrapConfigCard({
  proxies = {},
  onSessionSaved,
  hasSessions = true,
  onCreateNewSession,
  forceExpand = false,
  onForceExpandHandled = () => {},
}) {
  const {
    detectedIp,
    sessionLabel,
    setSessionLabel,
    mamId,
    setMamId,
    sessionType,
    setSessionType,
    ipMonitoringMode,
    setIpMonitoringMode,
    mamIp,
    setMamIp,
    checkFrequency,
    setCheckFrequency,
    oldLabel,
    proxy,
    setProxy,
    prowlarr,
    setProwlarr,
    chaptarr,
    setChaptarr,
    mamSessionCreatedDate,
    setMamSessionCreatedDate,
  } = useSession();

  // Local state for editing label
  const [label, setLabel] = useState(sessionLabel || '');

  // Keep local label in sync when session changes
  useEffect(() => {
    setLabel(sessionLabel || '');
  }, [sessionLabel]);
  // New: Local state for save status
  const [saveStatus, setSaveStatus] = useState('');
  const [saveError, setSaveError] = useState('');
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
  const [proxyLabel, setProxyLabel] = useState('');
  // proxies now comes from props
  // proxyStatus.ip will now be the actual proxied public IP (not the proxy server's host)
  const [_proxyStatus, setProxyStatus] = useState({
    asn: '',
    ip: '',
    valid: false,
  });
  // Local state for immediate proxy test result
  const [localProxiedIp, setLocalProxiedIp] = useState('');

  // Validation state
  const [labelError, setLabelError] = useState('');

  useEffect(() => {
    setProxyLabel(proxy?.label || '');
  }, [proxy]);

  // When proxyLabel changes, trigger backend detection for proxy IP/ASN
  useEffect(() => {
    if (!proxyLabel) {
      setProxyStatus({ asn: '', ip: '', valid: false });
      setLocalProxiedIp('');
      return;
    }
    // When a proxy is selected, immediately check its public IP (without requiring save)
    fetch(`/api/proxy_test/${encodeURIComponent(proxyLabel)}`)
      .then((res) => res.json())
      .then((status) => {
        if (status?.proxied_ip) {
          setProxyStatus({
            asn: status.proxied_asn || '',
            ip: status.proxied_ip,
            valid: true,
          });
          setLocalProxiedIp(status.proxied_ip);
        } else {
          setProxyStatus({ asn: '', ip: '', valid: false });
          setLocalProxiedIp('');
        }
      })
      .catch(() => {
        setProxyStatus({ asn: '', ip: '', valid: false });
        setLocalProxiedIp('');
      });
  }, [proxyLabel]);

  // Validation logic
  useEffect(() => {
    setLabelError(!label || label.trim() === '' ? 'Session label is required.' : '');
  }, [label]);

  // Track if user has attempted to save (for validation display)
  const [showValidation, setShowValidation] = useState(false);

  const sessionTypeError = !sessionType || sessionType === '' ? 'Required' : '';
  const freqNumeric = Number(checkFrequency);
  const freqError =
    !checkFrequency || String(checkFrequency) === '' || Number.isNaN(freqNumeric) || freqNumeric < 1
      ? 'Required'
      : '';
  const mamIdError = !mamId || mamId.trim() === '';
  const ipError = !mamIp || mamIp.trim() === '';

  const allValid = !labelError && !mamIdError && !sessionTypeError && !ipError && !freqError;

  // Save config handler
  const handleSave = async () => {
    setSaveStatus('');
    setSaveError('');
    setShowValidation(true); // Show validation errors on save attempt
    if (!allValid) return;
    // Only update global sessionLabel on save
    setSessionLabel(label);
    const payload = {
      check_freq: typeof checkFrequency === 'number' ? checkFrequency : 0,
      label,
      mam: {
        ip_monitoring_mode: ipMonitoringMode,
        mam_id: mamId,
        session_type: sessionType,
      },
      mam_ip: mamIp,
      mam_session_created_date: mamSessionCreatedDate || null,
      old_label: oldLabel,
      prowlarr,
      chaptarr,
      proxy: { label: proxyLabel },
    };
    try {
      const res = await fetch('/api/session/save', {
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to save session');
      setSaveStatus('Session saved successfully.');
      setTimeout(() => setSaveStatus(''), 2000);
      if (onSessionSaved) onSessionSaved(label, oldLabel);
      if (setProxy) setProxy(payload.proxy);
    } catch (err) {
      setSaveError(`Error saving session: ${err.message}`);
    }
  };

  if (!hasSessions) {
    // Show only CTA banner and button
    return (
      <Card
        sx={{
          alignItems: 'center',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          mb: 3,
          minHeight: 220,
          p: 3,
        }}
      >
        <Box sx={{ mb: 2, width: '100%' }}>
          <Alert severity="info" sx={{ fontSize: 17, px: 3, py: 2, textAlign: 'center' }}>
            Create a new session to get started.
          </Alert>
        </Box>
        <Button
          color="primary"
          onClick={onCreateNewSession}
          size="large"
          sx={{
            borderRadius: 2,
            fontSize: 18,
            fontWeight: 600,
            mt: 1,
            px: 4,
            py: 1.5,
          }}
          variant="contained"
        >
          Create New Session
        </Button>
      </Card>
    );
  }

  // Restore the full config form rendering
  return (
    <Card sx={{ borderRadius: 2, mb: 3 }}>
      {/* Snackbar for save status */}
      <Snackbar
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
        autoHideDuration={3000}
        onClose={() => {
          setSaveStatus('');
          setSaveError('');
        }}
        open={!!saveStatus || !!saveError}
      >
        {saveStatus ? (
          <Alert severity="success" sx={{ width: '100%' }}>
            {saveStatus}
          </Alert>
        ) : saveError ? (
          <Alert severity="error" sx={{ width: '100%' }}>
            {saveError}
          </Alert>
        ) : null}
      </Snackbar>
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
        <Typography sx={{ flexGrow: 1 }} variant="h6">
          Session Configuration
        </Typography>
        <IconButton size="small">{expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          {/* Padding above first row, only visible when expanded */}
          <Box sx={{ height: 7 }} />
          <Box sx={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <TextField
              error={showValidation && !!labelError}
              helperText={showValidation && labelError}
              label="Session Label"
              onChange={(e) => setLabel(e.target.value)}
              required
              size="small"
              sx={{ width: 145 }}
              value={label}
            />

            <FormControl
              error={showValidation && !!sessionTypeError}
              size="small"
              sx={{ maxWidth: 175, minWidth: 150 }}
            >
              <InputLabel
                error={showValidation && !!sessionTypeError}
                required
                sx={{ color: showValidation && sessionTypeError ? 'error.main' : undefined }}
              >
                Session Type
              </InputLabel>
              <Select
                error={showValidation && !!sessionTypeError}
                label="Session Type"
                MenuProps={{ disableScrollLock: true }}
                onChange={(e) => setSessionType(e.target.value)}
                required
                sx={{ maxWidth: 195, minWidth: 150 }}
                value={sessionType || ''}
              >
                <MenuItem value="">Select...</MenuItem>
                <MenuItem value="IP Locked">IP Locked</MenuItem>
                <MenuItem value="ASN Locked">ASN Locked</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}>
              <FormControl size="small" sx={{ maxWidth: 175, minWidth: 130 }}>
                <InputLabel>IP Monitoring</InputLabel>
                <Select
                  label="IP Monitoring"
                  MenuProps={{ disableScrollLock: true }}
                  onChange={(e) => setIpMonitoringMode(/** @type {any} */ (e.target.value))}
                  sx={{ maxWidth: 175, minWidth: 130 }}
                  value={ipMonitoringMode || 'auto'}
                >
                  <MenuItem value="auto">Auto (Full)</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                  <MenuItem value="static">Static (No Monitoring)</MenuItem>
                </Select>
              </FormControl>
              <Tooltip
                arrow
                title={
                  <div>
                    <strong>Auto (Full):</strong> Automatic IP detection with multiple fallbacks
                    <br />
                    <strong>Manual:</strong> User-controlled IP updates only
                    <br />
                    <strong>Static:</strong> No IP monitoring (for static IPs or restricted
                    networks)
                  </div>
                }
              >
                <IconButton size="small">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}>
              <FormControl
                error={showValidation && !!freqError}
                size="small"
                sx={{ maxWidth: 145, minWidth: 100 }}
              >
                <InputLabel>Interval*</InputLabel>
                <Select
                  label="Interval"
                  MenuProps={{ disableScrollLock: true }}
                  onChange={(e) => {
                    const v = /** @type {any} */ (e.target.value);
                    if (v === '' || v === null) {
                      setCheckFrequency('');
                    } else {
                      setCheckFrequency(Number(v));
                    }
                  }}
                  required
                  sx={{ maxWidth: 145, minWidth: 100 }}
                  value={checkFrequency === '' ? '' : checkFrequency}
                >
                  <MenuItem value="">Select...</MenuItem>
                  <MenuItem value={1}>1</MenuItem>
                  {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((val) => (
                    <MenuItem key={val} value={val}>
                      {val}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip arrow title="How often to check the IP/ASN for changes">
                <IconButton size="small">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, mb: 3 }}>
            <TextField
              error={showValidation && mamIdError}
              helperText={
                showValidation && mamIdError
                  ? 'MAM ID is required'
                  : 'Paste your full MAM ID here (required)'
              }
              label="MAM ID"
              maxRows={showMamId ? 6 : 2}
              minRows={showMamId ? 6 : 2}
              multiline
              onChange={(e) => setMamId(e.target.value)}
              required
              size="small"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showMamId ? 'Hide MAM ID' : 'Show MAM ID'}
                        edge="end"
                        onClick={() => setShowMamId((v) => !v)}
                      >
                        {showMamId ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
                htmlInput: {
                  maxLength: 300,
                  style: showMamId ? {} : { WebkitTextSecurity: 'disc' },
                },
              }}
              sx={{ width: { md: 450, sm: 400, xs: '100%' } }}
              value={mamId}
            />
            <Tooltip arrow title="Open MyAnonamouse Security page to create or update your MAM ID">
              <Button
                href="https://www.myanonamouse.net/preferences/index.php?view=security"
                rel="noopener noreferrer"
                size="small"
                sx={{ height: 40, mb: 3.2, minWidth: 160, whiteSpace: 'nowrap' }}
                target="_blank"
                variant="outlined"
              >
                Manage MAM ID
              </Button>
            </Tooltip>
          </Box>

          {/* MAM Session Created Date */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: 2 }}>
              <TextField
                helperText="Necessary for expiry tracking"
                label="MAM Session Created Date"
                onChange={(e) => setMamSessionCreatedDate(e.target.value || null)}
                size="small"
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                sx={{
                  width: 320,
                  // Tell browser to use dark mode for the native picker popup
                  '& input[type="datetime-local"]': {
                    colorScheme: (theme) => theme.palette.mode,
                  },
                  // Make the calendar icon more visible in dark mode
                  '& input[type="datetime-local"]::-webkit-calendar-picker-indicator': {
                    filter: (theme) =>
                      theme.palette.mode === 'dark' ? 'brightness(0) invert(0.7)' : 'none',
                    cursor: 'pointer',
                  },
                }}
                type="datetime-local"
                value={mamSessionCreatedDate || ''}
              />
              <Button
                onClick={async () => {
                  // Get current server time in server's timezone
                  try {
                    const response = await fetch('/api/server_time');
                    const data = await response.json();
                    // server_time is in ISO format with timezone (e.g., "2025-10-02T19:27:35.151188-05:00")
                    // We need to extract just the date and time portion for datetime-local
                    // which expects format: YYYY-MM-DDTHH:MM
                    const isoString = data.server_time;
                    const dateTimeLocal = isoString.substring(0, 16); // Extract YYYY-MM-DDTHH:MM
                    setMamSessionCreatedDate(dateTimeLocal);
                  } catch (error) {
                    console.error('Failed to get server time:', error);
                    // Fallback to local time if server request fails
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    setMamSessionCreatedDate(`${year}-${month}-${day}T${hours}:${minutes}`);
                  }
                }}
                size="small"
                sx={{ height: 40, mt: 0 }}
                variant="outlined"
              >
                Now
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, mb: 3 }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ alignItems: 'center', display: 'flex', gap: 2 }}>
                <TextField
                  error={showValidation && ipError}
                  helperText={
                    showValidation && ipError
                      ? 'IP Address is required'
                      : 'IP to associate with MAM ID'
                  }
                  label="IP Address"
                  onChange={(e) => setMamIp(e.target.value)}
                  placeholder="e.g. 203.0.113.99"
                  required
                  size="small"
                  slotProps={{
                    htmlInput: {
                      maxLength: 16,
                    },
                  }}
                  sx={{ width: 205 }}
                  value={mamIp}
                />
                <Box
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.25,
                  }}
                >
                  <Button
                    disabled={!detectedIp}
                    onClick={() => setMamIp(detectedIp)}
                    size="small"
                    sx={{ height: 40, mb: 0.2, minWidth: 120 }}
                    variant="outlined"
                  >
                    USE DETECTED IP
                  </Button>
                  <Typography color="text.secondary" sx={{ mt: 0.2 }} variant="caption">
                    {detectedIp || 'No IP detected'}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.25,
                  }}
                >
                  <Button
                    color="primary"
                    disabled={!localProxiedIp}
                    onClick={() => setMamIp(localProxiedIp)}
                    size="small"
                    sx={{ height: 40, mb: 0.2, minWidth: 120 }}
                    variant="outlined"
                  >
                    USE PROXY IP
                  </Button>
                  <Typography color="text.secondary" sx={{ mt: 0.2 }} variant="caption">
                    {localProxiedIp || 'No proxy IP detected'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ alignItems: 'center', display: 'flex', mt: 2 }}>
                <FormControl size="small" sx={{ maxWidth: 320, minWidth: 260 }}>
                  <InputLabel>Proxy</InputLabel>
                  <Select
                    label="Proxy"
                    MenuProps={{
                      disableScrollLock: true,
                      PaperProps: {
                        style: { maxWidth: 320, minWidth: 260 },
                      },
                    }}
                    onChange={(e) => setProxyLabel(e.target.value)}
                    sx={{ maxWidth: 320, minWidth: 260 }}
                    value={proxyLabel}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {Object.keys(proxies).map((label) => (
                      <MenuItem key={label} style={{ whiteSpace: 'normal' }} value={label}>
                        {label} ({proxies[label].host}:{proxies[label].port})
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      pl: 1,
                      pt: 0.5,
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    variant="caption"
                  >
                    Select a proxy to use for this session (optional)
                  </Typography>
                </FormControl>
              </Box>
            </Box>
          </Box>

          {/* Indexer Integrations (Prowlarr & Chaptarr) */}
          <IndexerIntegrations
            _mamSessionCreatedDate={mamSessionCreatedDate}
            chaptarrConfig={chaptarr}
            prowlarrConfig={prowlarr}
            sessionLabel={sessionLabel}
            setChaptarrConfig={setChaptarr}
            setMamSessionCreatedDate={setMamSessionCreatedDate}
            setProwlarrConfig={setProwlarr}
          />

          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button
              color="primary"
              disabled={!allValid || !sessionType}
              onClick={handleSave}
              variant="contained"
            >
              SAVE
            </Button>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
}

MouseTrapConfigCard.propTypes = {
  forceExpand: PropTypes.bool,
  hasSessions: PropTypes.bool,
  onCreateNewSession: PropTypes.func,
  onForceExpandHandled: PropTypes.func,
  onSessionSaved: PropTypes.func,
};

MouseTrapConfigCard.defaultProps = {
  forceExpand: false,
  hasSessions: true,
  onCreateNewSession: () => {},
  onForceExpandHandled: () => {},
};
