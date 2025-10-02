import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { useSession } from '../context/SessionContext.jsx';
import { getStatusMessageColor, stringifyMessage } from '../utils/utils.jsx';
import AutomationStatusRow from './AutomationStatusRow';
import MamDetailsAccordion from './MamDetailsAccordion';
import NetworkProxyDetailsAccordion from './NetworkProxyDetailsAccordion';
import TimerDisplay from './TimerDisplay';

/**
 * @typedef {{
 *   autoWedge:boolean,
 *   autoVIP:boolean,
 *   autoUpload:boolean,
 *   onStatusUpdate?:function,
 *   onSessionDataChanged?:function,
 * }} StatusCardProps
 */
const StatusCard = forwardRef(
  /** @param {StatusCardProps} props */
  function StatusCard({ autoWedge, autoVIP, autoUpload, onStatusUpdate }, ref) {
    const { sessionLabel, setDetectedIp, setPoints, setCheese, status, setStatus } = useSession();
    // Removed local status/setStatus, use context only
    // Timer is now derived from backend only; no local countdown
    const [timer, setTimer] = useState(0);
    const [snackbar, setSnackbar] = useState({
      message: '',
      open: false,
      severity: 'info',
    });
    const [seedboxStatus, setSeedboxStatus] = useState(null);
    const [seedboxLoading, setSeedboxLoading] = useState(false);

    // Keep a stable ref to onStatusUpdate so fetchStatus doesn't need to include
    // the callback in its dependency array (which can change identity each render).
    const onStatusUpdateRef = React.useRef(onStatusUpdate);
    useEffect(() => {
      onStatusUpdateRef.current = onStatusUpdate;
    }, [onStatusUpdate]);

    // Fetch status from backend
    const fetchStatus = useCallback(
      async (force = false) => {
        try {
          let url = sessionLabel
            ? `/api/status?label=${encodeURIComponent(sessionLabel)}`
            : '/api/status';
          if (force) url += `${url.includes('?') ? '&' : '?'}force=1`;

          const res = await fetch(url);
          // Handle non-OK HTTP responses explicitly so we don't rely on json() throwing
          let data;
          try {
            if (!res.ok) {
              // Try to parse JSON error payload when available, otherwise fall back to text
              try {
                data = await res.json();
              } catch (_) {
                const text = await res.text();
                data = { error: `HTTP ${res.status}: ${text}` };
              }
            } else {
              data = await res.json();
            }
          } catch (err) {
            // Defensive fallback
            console.debug('[StatusCard] Failed to parse response from', url, err);
            throw err;
          }
          // Helpful debug for development: show the raw backend response
          console.debug('[StatusCard] fetchStatus response:', url, data);
          if (data.success === false || data.error) {
            setStatus({ error: data.error || 'Unknown error from backend.' });
            setSnackbar({
              message: stringifyMessage(data.error || 'Unknown error from backend.'),
              open: true,
              severity: 'error',
            });
            setPoints?.(null);
            setCheese?.(null);
            return;
          }
          const detectedIp = data.detected_public_ip || '';
          const newStatus = {
            asn: data.asn || '',
            check_freq: data.check_freq || 5, // minutes, from backend
            cheese: data.cheese ?? null,
            configured: data.configured ?? null,
            current_ip: data.current_ip,
            current_ip_asn: data.current_ip_asn,
            details: data.details || {}, // raw backend details
            detected_public_ip: data.detected_public_ip,
            detected_public_ip_as: data.detected_public_ip_as,
            detected_public_ip_asn: data.detected_public_ip_asn,
            ip: detectedIp,
            last_check_time: data.last_check_time || null,
            last_result: data.message || '',
            last_update_mamid: data.mam_id || '',
            mam_cookie_exists: data.mam_cookie_exists,
            mam_session_as: data.mam_session_as,
            next_check_time: data.next_check_time || null, // <-- NEW
            points: data.points ?? null,
            proxied_public_ip: data.proxied_public_ip,
            proxied_public_ip_as: data.proxied_public_ip_as,
            proxied_public_ip_asn: data.proxied_public_ip_asn,
            proxy_error: data.proxy_error ?? null,
            ratelimit: data.ratelimit || 0, // seconds, from backend
            status_message: data.status_message || '', // user-friendly status message
            vault_automation_enabled: data.vault_automation_enabled || false,
          };
          setStatus(newStatus);
          if (onStatusUpdateRef.current) onStatusUpdateRef.current(newStatus);
          setDetectedIp?.(detectedIp);
          setPoints?.(data.points ?? null);
          setCheese?.(data.cheese ?? null);
        } catch (e) {
          setStatus({ error: e.message || 'Failed to fetch status.' });
          setSnackbar({
            message: stringifyMessage(e.message || 'Failed to fetch status.'),
            open: true,
            severity: 'error',
          });
          setPoints?.(null);
          setCheese?.(null);
        }
      },
      [sessionLabel, setStatus, setDetectedIp, setPoints, setCheese],
    );

    // Poll backend every 5 seconds for status, but only if session is fully configured
    const isConfigured = status && status.configured !== false && status.next_check_time;
    const isNearNextCheck = timer <= 10;

    useEffect(() => {
      if (!isConfigured || !isNearNextCheck) {
        return undefined;
      }

      const intervalId = setInterval(async () => {
        try {
          await fetchStatus(false);
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 5000);

      return () => clearInterval(intervalId);
    }, [fetchStatus, isConfigured, isNearNextCheck]);

    // Timer is always derived from backend's next_check_time and current time
    useEffect(() => {
      // Calculate timer immediately when next_check_time changes
      const calculateTimer = () => {
        if (status?.next_check_time) {
          const nextCheck = Date.parse(status.next_check_time);
          const now = Date.now();
          const secondsLeft = Math.floor((nextCheck - now) / 1000);
          setTimer(Math.max(0, secondsLeft));
        } else {
          setTimer(0);
        }
      };

      // Run immediately
      calculateTimer();

      // Then run every second
      const interval = setInterval(calculateTimer, 1000);
      return () => clearInterval(interval);
    }, [status?.next_check_time]); // Use optional chaining and the actual string value

    // On initial load/session select, fetch latest status (do NOT force a backend check)
    useEffect(() => {
      // Clear status and seedbox status to show loading/blank until check completes
      setStatus(null);
      setSeedboxStatus(null);
      fetchStatus(false);
      // Only run this on mount and when fetchStatus identity changes (which will
      // happen when sessionLabel or stable setters change). This avoids re-running
      // the effect every render when parent callbacks are unstable.
    }, [fetchStatus, setStatus]);

    // Handler for 'Check Now' button
    const handleCheckNow = async () => {
      await fetchStatus(true);
      setSnackbar({ message: 'Checked now!', open: true, severity: 'success' });
    };

    // Handler for 'Update Seedbox' button
    const handleUpdateSeedbox = async () => {
      if (!sessionLabel) return;
      setSeedboxLoading(true);
      setSeedboxStatus(null);
      try {
        const res = await fetch('/api/session/update_seedbox', {
          body: JSON.stringify({ label: sessionLabel }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });
        const data = await res.json();
        setSeedboxStatus(data);
        setSnackbar({
          message: data.success ? data.msg || 'Seedbox updated!' : data.error || 'Update failed',
          open: true,
          severity: data.success ? 'success' : 'warning',
        });
        fetchStatus(); // Refresh status after update
      } catch (e) {
        setSeedboxStatus({ error: e.message, success: false });
        setSnackbar({
          message: 'Seedbox update failed',
          open: true,
          severity: 'error',
        });
      } finally {
        setSeedboxLoading(false);
      }
    };

    // Expose a method for parent to force a status refresh (e.g., after session save)
    useImperativeHandle(ref, () => ({
      fetchStatus,
      forceStatusRefresh: handleCheckNow,
    }));

    return (
      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent>
          {/* Session Status Header: align text and icon vertically with buttons */}
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                gap: 3,
                minHeight: 48,
              }}
            >
              <Box sx={{ alignItems: 'center', display: 'flex', height: 40 }}>
                <Typography
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    height: 40,
                    mb: 0,
                    mr: 1,
                  }}
                  variant="h6"
                >
                  Session Status
                </Typography>
                {/* Session Status Icon Logic (finalized) */}
                {(() => {
                  if (!status || status.configured === false || !status.mam_cookie_exists)
                    return null;
                  const details = status.details || {};
                  // Show red X if last check was unsuccessful (error present, or success false)
                  if (details.error || details.success === false) {
                    return (
                      <CancelIcon
                        sx={{
                          color: 'error.main',
                          fontSize: 28,
                          verticalAlign: 'middle',
                        }}
                        titleAccess="Session error"
                      />
                    );
                  }
                  // Show green check if last check was successful (no error, and success is true or missing/undefined/null)
                  if (
                    !details.error &&
                    (details.success === true ||
                      details.success === undefined ||
                      details.success === null)
                  ) {
                    return (
                      <CheckCircleIcon
                        sx={{
                          color: 'success.main',
                          fontSize: 28,
                          verticalAlign: 'middle',
                        }}
                        titleAccess="Session valid"
                      />
                    );
                  }
                  // Show yellow question mark if status is unknown (no error, no explicit success/failure)
                  return (
                    <InfoOutlinedIcon
                      sx={{
                        color: 'warning.main',
                        fontSize: 28,
                        verticalAlign: 'middle',
                      }}
                      titleAccess="Session unknown"
                    />
                  );
                })()}
              </Box>
              {/* Connectable Status */}
              <Box sx={{ alignItems: 'center', display: 'flex', height: 40 }}>
                <Typography
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    height: 40,
                    mb: 0,
                    mr: 1,
                  }}
                  variant="h6"
                >
                  Connectable
                </Typography>
                {(() => {
                  if (!status || !status.details || !status.details.raw) return null;
                  const connectable = status.details.raw.connectable;

                  if (connectable === undefined || connectable === null || connectable === 'N/A')
                    return null;

                  if (connectable === 'yes') {
                    return (
                      <CheckCircleIcon
                        sx={{
                          color: 'success.main',
                          fontSize: 28,
                          verticalAlign: 'middle',
                        }}
                        titleAccess="Connectable: Yes"
                      />
                    );
                  }
                  if (connectable === 'no') {
                    return (
                      <CancelIcon
                        sx={{
                          color: 'error.main',
                          fontSize: 28,
                          verticalAlign: 'middle',
                        }}
                        titleAccess="Connectable: No"
                      />
                    );
                  }

                  return null;
                })()}
              </Box>
            </Box>
            <Box>
              <Tooltip title="Refreshes session status from MAM">
                <span>
                  <Button onClick={handleCheckNow} size="small" sx={{ ml: 2 }} variant="outlined">
                    Check Now
                  </Button>
                </span>
              </Tooltip>
              {/* USE DETECTED IP and USE DETECTED VPN IP buttons moved to MouseTrapConfigCard */}
              <Tooltip title="Updates your session's IP/ASN with MAM (rate-limited to once per hour)">
                <span>
                  <Button
                    color="secondary"
                    disabled={seedboxLoading || !sessionLabel}
                    onClick={handleUpdateSeedbox}
                    size="small"
                    sx={{ ml: 2 }}
                    variant="contained"
                  >
                    {seedboxLoading ? 'Updating...' : 'Update Seedbox'}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Box>
          {/* MAM Details Accordion (restored, styled to match) */}
          {/* Robust error handling: if status is set and has error, only render the error alert */}
          {status?.error ? (
            <Box sx={{ mb: 2, mt: 2 }}>
              <Alert severity="error">{status.error}</Alert>
            </Box>
          ) : status ? (
            status.configured === false ||
            (status.status_message &&
              status.status_message ===
                'Session not configured. Please save session details to begin.') ? (
              <Box sx={{ mb: 2, mt: 2 }}>
                <Alert severity="info">
                  {status.status_message ||
                    'Session not configured. Please save session details to begin.'}
                </Alert>
              </Box>
            ) : (
              <Box>
                {/* Timer Display and Automation Status Row */}
                {status.last_check_time && (
                  <React.Fragment>
                    <TimerDisplay timer={timer} />
                    <Typography
                      sx={{ fontWeight: 500, mt: 1, textAlign: 'center' }}
                      variant="body2"
                    >
                      {/* Unified, styled status message */}
                      {(() => {
                        // Prefer rate limit message if present
                        let msg = status.status_message || status.last_result || 'unknown';
                        if (
                          !(
                            typeof msg === 'string' &&
                            /rate limit: last change too recent/i.test(msg)
                          ) &&
                          status.details &&
                          typeof status.details === 'object' &&
                          status.details.error &&
                          /rate limit: last change too recent/i.test(status.details.error)
                        ) {
                          msg = status.details.error;
                        }
                        const color = getStatusMessageColor(msg);
                        return (
                          <Box sx={{ mt: 1, textAlign: 'center' }}>
                            <Typography
                              color={color}
                              sx={{ fontWeight: 600, letterSpacing: 0.5 }}
                              variant="subtitle2"
                            >
                              {msg}
                            </Typography>
                          </Box>
                        );
                      })()}
                    </Typography>
                    {/* Proxy/VPN error warning below timer/status */}
                    {status.proxy_error && (
                      <Box sx={{ mb: 1, mt: 2 }}>
                        <Alert severity="warning">{status.proxy_error}</Alert>
                      </Box>
                    )}
                    <AutomationStatusRow
                      autoUpload={autoUpload}
                      autoVIP={autoVIP}
                      autoWedge={autoWedge}
                      vaultAutomation={status.vault_automation_enabled}
                    />
                    <MamDetailsAccordion status={status} />
                    {/* Network & Proxy Details Accordion */}
                    <NetworkProxyDetailsAccordion status={status} />
                    {/* 1px invisible box for padding/squared corners below Network Details accordion */}
                    <Box
                      sx={{
                        background: 'none',
                        border: 0,
                        height: 1,
                        m: 0,
                        p: 0,
                        width: '100%',
                      }}
                    />
                  </React.Fragment>
                )}
              </Box>
            )
          ) : (
            <Typography color="text.secondary">Loading status...</Typography>
          )}
          <Snackbar
            autoHideDuration={2000}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            open={snackbar.open}
          >
            <Alert
              onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
              severity={/** @type {any} */ (snackbar.severity)}
              sx={{ width: '100%' }}
            >
              {stringifyMessage(snackbar.message)}
            </Alert>
          </Snackbar>
          <Divider sx={{ my: 2 }} />
          {/* Seedbox update status */}
          {seedboxStatus && (
            <Box sx={{ mb: 2 }}>
              <Alert severity={seedboxStatus.success ? 'success' : 'warning'}>
                {seedboxStatus.msg || seedboxStatus.error || 'Seedbox update status unknown.'}
              </Alert>
            </Box>
          )}
          {/* Make sure this is the end of CardContent, after all conditional Boxes are closed */}
        </CardContent>
      </Card>
    );
  },
);

export default StatusCard;
