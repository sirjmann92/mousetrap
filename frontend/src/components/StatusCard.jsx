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
      console.log(`[StatusCard] Fetching status: url=${url} force=${force}`); // Diagnostic log
      const res = await fetch(url);
      const data = await res.json();
      if (data.success === false || data.error) {
        setStatus({ error: data.error || 'Unknown error from backend.' });
        setSnackbar({ open: true, message: stringifyMessage(data.error || 'Unknown error from backend.'), severity: 'error' });
        setPoints && setPoints(null);
        setCheese && setCheese(null);
        return;
      }
      const detectedIp = data.detected_public_ip || data.current_ip || "";
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

  // Timer logic: always use backend next_check_time
  useEffect(() => {
    let timerInterval = null;
    let pollInterval = null;
    let polling = false;
    let lastNextCheckTime = status && status.next_check_time;

    const startTimer = () => {
      timerInterval = setInterval(() => {
        if (status && status.next_check_time) {
          const nextCheck = Date.parse(status.next_check_time);
          const now = Date.now();
          let secondsLeft = Math.floor((nextCheck - now) / 1000);
          secondsLeft = Math.max(0, secondsLeft);
          setTimer(secondsLeft);
          if (secondsLeft === 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            // When timer hits zero, just fetch the latest status (do NOT force a backend check)
            fetchStatus(false);
            startPolling();
          }
        } else {
          setTimer(0);
          lastForcedCheckRef.current = null;
        }
      }, 1000);
    };

    const startPolling = () => {
      polling = true;
      let lastCheckTime = status && status.last_check_time;
      let lastStatusMsg = status && status.status_message;
      let lastPoints = status && status.points;
      pollInterval = setInterval(async () => {
        await fetchStatus(false);
        // After fetch, check if a backend update is detected
        if (
          (status && status.last_check_time && status.last_check_time !== lastCheckTime) ||
          (status && status.status_message && status.status_message !== lastStatusMsg) ||
          (status && status.points && status.points !== lastPoints)
        ) {
          lastCheckTime = status.last_check_time;
          lastPoints = status.points;
          if (onSessionDataChanged) onSessionDataChanged();
        }
        // After fetch, check if next_check_time has updated (for timer restart)
        if (status && status.next_check_time && status.next_check_time !== lastNextCheckTime) {
          clearInterval(pollInterval);
          pollInterval = null;
          polling = false;
          lastNextCheckTime = status.next_check_time;
          startTimer();
        }
      }, 5000);
    };

    // Start the timer on mount or when next_check_time/sessionLabel changes
    if (status && status.next_check_time) {
      setTimer(Math.max(0, Math.floor((Date.parse(status.next_check_time) - Date.now()) / 1000)));
      startTimer();
    } else {
      setTimer(0);
      lastForcedCheckRef.current = null;
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [status && status.next_check_time, sessionLabel]);

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
                      const msg = status.status_message || status.last_result || "unknown";
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
                  <AutomationStatusRow autoWedge={autoWedge} autoVIP={autoVIP} autoUpload={autoUpload} />
                  <MamDetailsAccordion status={status} />
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

