import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, Typography, Box, Snackbar, Alert, Divider, Button, Tooltip, IconButton } from "@mui/material";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getStatusMessageColor } from '../utils/utils';
import { stringifyMessage, renderASN } from '../utils/statusUtils';
import RateLimitTimer from './RateLimitTimer';
import NetworkProxyDetailsAccordion from './NetworkProxyDetailsAccordion';
import MamDetailsAccordion from './MamDetailsAccordion';
import AutomationStatusRow from './AutomationStatusRow';
import TimerDisplay from './TimerDisplay';

import { useSession } from '../context/SessionContext';

const StatusCard = forwardRef(function StatusCard({ autoWedge, autoVIP, autoUpload, onSessionSaved, onSessionDataChanged, onStatusUpdate }, ref) {
  const { sessionLabel, setDetectedIp, setPoints, setCheese, status, setStatus } = useSession();
  const [wedges, setWedges] = useState(null);
  // Removed local status/setStatus, use context only
  // Timer is now derived from backend only; no local countdown
  const [timer, setTimer] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [seedboxStatus, setSeedboxStatus] = useState(null);
  const [seedboxLoading, setSeedboxLoading] = useState(false);
  const pollingRef = useRef();
  const lastCheckRef = useRef(null);
  const lastForcedCheckRef = useRef(null); // Track last next_check_time for which we forced a check

  // Fetch status from backend
  const fetchStatus = async (force = false) => {
    try {
      let url = sessionLabel ? `/api/status?label=${encodeURIComponent(sessionLabel)}` : "/api/status";
      if (force) url += (url.includes('?') ? '&' : '?') + 'force=1';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success === false || data.error) {
        setStatus({ error: data.error || 'Unknown error from backend.' });
        setSnackbar({ open: true, message: stringifyMessage(data.error || 'Unknown error from backend.'), severity: 'error' });
        setPoints && setPoints(null);
        setCheese && setCheese(null);
        return;
      }
      const detectedIp = data.detected_public_ip || "";
      const newStatus = {
        last_update_mamid: data.mam_id || "",
        ratelimit: data.ratelimit || 0, // seconds, from backend
        check_freq: data.check_freq || 5, // minutes, from backend
        last_result: data.message || "",
        ip: detectedIp,
        current_ip: data.current_ip,
        current_ip_asn: data.current_ip_asn,
        detected_public_ip: data.detected_public_ip,
        detected_public_ip_asn: data.detected_public_ip_asn,
        detected_public_ip_as: data.detected_public_ip_as,
        proxied_public_ip: data.proxied_public_ip,
        proxied_public_ip_asn: data.proxied_public_ip_asn,
        proxied_public_ip_as: data.proxied_public_ip_as,
        mam_cookie_exists: data.mam_cookie_exists,
        mam_session_as: data.mam_session_as,
        asn: data.asn || "",
        last_check_time: data.last_check_time || null,
        next_check_time: data.next_check_time || null, // <-- NEW
        points: data.points || null,
        cheese: data.cheese || null,
        status_message: data.status_message || "", // user-friendly status message
        details: data.details || {}, // raw backend details
      };
      setStatus(newStatus);
      if (onStatusUpdate) onStatusUpdate(newStatus);
      setDetectedIp && setDetectedIp(detectedIp);
      setPoints && setPoints(data.points || null);
      setCheese && setCheese(data.cheese || null);
    } catch (e) {
      setStatus({ error: e.message || 'Failed to fetch status.' });
      setSnackbar({ open: true, message: stringifyMessage(e.message || 'Failed to fetch status.'), severity: 'error' });
      setPoints && setPoints(null);
      setCheese && setCheese(null);
    }
  };

  // Poll backend every 5 seconds for status, but only if session is fully configured
  useEffect(() => {
    let pollInterval = null;
    let lastNextCheckTime = status && status.next_check_time;
    let polling = false;

    const isConfigured = status && status.configured !== false && status.next_check_time;

    const startPolling = () => {
      if (polling) return;
      polling = true;
      pollInterval = setInterval(async () => {
        const res = await fetchStatus(false);
        const newNextCheck = (res && res.next_check_time) || (status && status.next_check_time);
        if (newNextCheck && newNextCheck !== lastNextCheckTime) {
          lastNextCheckTime = newNextCheck;
          clearInterval(pollInterval);
          pollInterval = null;
          polling = false;
        }
      }, 5000);
    };

    // Only poll if session is configured and timer hits 0
    if (isConfigured && timer === 0) {
      startPolling();
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [timer, sessionLabel, status && status.next_check_time, status && status.configured]);

  // Timer is always derived from backend's next_check_time and current time
  useEffect(() => {
    let interval = setInterval(() => {
      if (status && status.next_check_time) {
        const nextCheck = Date.parse(status.next_check_time);
        const now = Date.now();
        let secondsLeft = Math.floor((nextCheck - now) / 1000);
        setTimer(Math.max(0, secondsLeft));
      } else {
        setTimer(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [status && status.next_check_time]);

  // Always perform a force=1 status check on first load/session select
  // On initial load/session select, fetch latest status (do NOT force a backend check)
  useEffect(() => {
    if (!sessionLabel) return;
    setStatus(null); // Clear status to show loading/blank until check completes
    fetchStatus(false);
    // eslint-disable-next-line
  }, [sessionLabel]);

  // Clear seedbox status when session changes
  useEffect(() => {
    setSeedboxStatus(null);
  }, [sessionLabel]);

  // Handler for 'Check Now' button
  const handleCheckNow = async () => {
    await fetchStatus(true);
    setSnackbar({ open: true, message: 'Checked now!', severity: 'success' });
  };

  // Handler for 'Update Seedbox' button
  const handleUpdateSeedbox = async () => {
    if (!sessionLabel) return;
    setSeedboxLoading(true);
    setSeedboxStatus(null);
    try {
      const res = await fetch('/api/session/update_seedbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: sessionLabel })
      });
      const data = await res.json();
      setSeedboxStatus(data);
      setSnackbar({ open: true, message: data.success ? (data.msg || 'Seedbox updated!') : (data.error || 'Update failed'), severity: data.success ? 'success' : 'warning' });
      fetchStatus(); // Refresh status after update
    } catch (e) {
      setSeedboxStatus({ success: false, error: e.message });
      setSnackbar({ open: true, message: 'Seedbox update failed', severity: 'error' });
    } finally {
      setSeedboxLoading(false);
    }
  };

  // Expose a method for parent to force a status refresh (e.g., after session save)
  useImperativeHandle(ref, () => ({
    fetchStatus,
    forceStatusRefresh: handleCheckNow
  }));

  return (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent>
        {/* Session Status Header: align text and icon vertically with buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 48 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: 40 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', height: 40, mb: 0, mr: 1 }}>
                Session Status
              </Typography>
              {/* Session Status Icon Logic (finalized) */}
              {(() => {
                if (!status || status.configured === false || !status.mam_cookie_exists) return null;
                const details = status.details || {};
                // Show red X if last check was unsuccessful (error present, or success false)
                if (details.error || details.success === false) {
                  return <CancelIcon sx={{ color: 'error.main', fontSize: 28, verticalAlign: 'middle' }} titleAccess="Session error" />;
                }
                // Show green check if last check was successful (no error, and success is true or missing/undefined/null)
                if (!details.error && (details.success === true || details.success === undefined || details.success === null)) {
                  return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 28, verticalAlign: 'middle' }} titleAccess="Session valid" />;
                }
                // Show yellow question mark if status is unknown (no error, no explicit success/failure)
                return <InfoOutlinedIcon sx={{ color: 'warning.main', fontSize: 28, verticalAlign: 'middle' }} titleAccess="Session unknown" />;
              })()}
            </Box>
          </Box>
          <Box>
            <Tooltip title="Refreshes session status from MAM">
              <span>
                <Button variant="outlined" size="small" onClick={handleCheckNow} sx={{ ml: 2 }}>
                  Check Now
                </Button>
              </span>
            </Tooltip>
            {/* USE DETECTED IP and USE DETECTED VPN IP buttons moved to MouseTrapConfigCard */}
            <Tooltip title="Updates your session's IP/ASN with MAM (rate-limited to once per hour)">
              <span>
                <Button variant="contained" size="small" color="secondary" onClick={handleUpdateSeedbox} sx={{ ml: 2 }} disabled={seedboxLoading || !sessionLabel}>
                  {seedboxLoading ? 'Updating...' : 'Update Seedbox'}
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>
  {/* Network & Proxy Details Accordion */}
  <NetworkProxyDetailsAccordion status={status} />
        {/* MAM Details Accordion (restored, styled to match) */}
        {/* Robust error handling: if status is set and has error, only render the error alert */}
        {status && status.error ? (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Alert severity="error">{status.error}</Alert>
          </Box>
        ) : status ? (
          (status.configured === false || (status.status_message && status.status_message === "Session not configured. Please save session details to begin.")) ? (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Alert severity="info">{status.status_message || "Session not configured. Please save session details to begin."}</Alert>
            </Box>
          ) : (
            <Box>
              {/* Timer Display and Automation Status Row */}
              {status.last_check_time && (
                <React.Fragment>
                  <TimerDisplay timer={timer} />
                  <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', fontWeight: 500 }}>
                    {/* Unified, styled status message */}
                    {(() => {
                      // Prefer rate limit message if present
                      let msg = status.status_message || status.last_result || "unknown";
                      if (typeof msg === 'string' && /rate limit: last change too recent/i.test(msg)) {
                        msg = msg;
                      } else if (
                        status.details && typeof status.details === 'object' && status.details.error && /rate limit: last change too recent/i.test(status.details.error)
                      ) {
                        msg = status.details.error;
                      }
                      const color = getStatusMessageColor(msg);
                      return (
                        <Box sx={{ mt: 1, textAlign: 'center' }}>
                          <Typography variant="subtitle2" color={color} sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                            {msg}
                          </Typography>
                        </Box>
                      );
                    })()}
                  </Typography>
                  {/* Proxy/VPN error warning below timer/status */}
                  {status.proxy_error && (
                    <Box sx={{ mt: 2, mb: 1 }}>
                      <Alert severity="warning">{status.proxy_error}</Alert>
                    </Box>
                  )}
                  <AutomationStatusRow autoWedge={autoWedge} autoVIP={autoVIP} autoUpload={autoUpload} />
                  <MamDetailsAccordion status={status} />
                  {/* 1px invisible box for padding/squared corners below MAM Details accordion */}
                  <Box sx={{ height: 1, width: '100%', border: 0, background: 'none', p: 0, m: 0 }} />
                </React.Fragment>
              )}
            </Box>
          )
        ) : (
          <Typography color="error">Status unavailable</Typography>
        )}
        <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
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
});

export default StatusCard;

