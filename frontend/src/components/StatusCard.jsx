import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, Typography, Box, Snackbar, Alert, Divider, Button } from "@mui/material";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const StatusCard = forwardRef(function StatusCard({ autoWedge, autoVIP, autoUpload, setDetectedIp, setPoints, setCheese, sessionLabel, onSessionSaved }, ref) {
  const [status, setStatus] = useState(null);
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
        if (setPoints) setPoints(null);
        if (setCheese) setCheese(null);
        return;
      }
      const detectedIp = data.detected_public_ip || data.current_ip || "";
      setStatus({
        last_update_mamid: data.mam_id || "",
        ratelimit: data.ratelimit || 0, // seconds, from backend
        check_freq: data.check_freq || 5, // minutes, from backend
        last_result: data.message || "",
        ip: detectedIp,
        current_ip: data.current_ip,
        current_ip_asn: data.current_ip_asn,
        detected_public_ip: data.detected_public_ip,
        detected_public_ip_asn: data.detected_public_ip_asn,
        mam_cookie_exists: data.mam_cookie_exists,
        asn: data.asn || "",
        last_check_time: data.last_check_time || null,
        next_check_time: data.next_check_time || null, // <-- NEW
        points: data.points || null,
        cheese: data.cheese || null,
        status_message: data.status_message || "", // user-friendly status message
        details: data.details || {}, // raw backend details
      });
      if (setDetectedIp) setDetectedIp(detectedIp);
      if (setPoints) setPoints(data.points || null);
      if (setCheese) setCheese(data.cheese || null);
    } catch (e) {
      setStatus({ error: e.message || 'Failed to fetch status.' });
      setSnackbar({ open: true, message: stringifyMessage(e.message || 'Failed to fetch status.'), severity: 'error' });
      if (setPoints) setPoints(null);
      if (setCheese) setCheese(null);
    }
  };

  // Timer logic: always use backend next_check_time
  useEffect(() => {
    let interval;
    if (status && status.next_check_time) {
      const updateTimer = () => {
        const nextCheck = Date.parse(status.next_check_time);
        const now = Date.now();
        let secondsLeft = Math.floor((nextCheck - now) / 1000);
        secondsLeft = Math.max(0, secondsLeft);
        setTimer(secondsLeft);
        if (secondsLeft === 0) {
          // Only force a status check if next_check_time has changed since last forced check
          if (lastForcedCheckRef.current !== status.next_check_time) {
            lastForcedCheckRef.current = status.next_check_time;
            fetchStatus(true);
          }
        } else {
          // Reset the forced check tracker if timer is not zero
          lastForcedCheckRef.current = null;
        }
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setTimer(0);
      lastForcedCheckRef.current = null;
    }
    return () => interval && clearInterval(interval);
  }, [status && status.next_check_time, sessionLabel]);

  // Always fetch status immediately after config save or session change
  useEffect(() => {
    // Smart refresh: only force if cache is stale
    const checkAndFetch = async () => {
      if (!sessionLabel) return;
      // Fetch cached status to check last_check_time
      let url = `/api/status?label=${encodeURIComponent(sessionLabel)}`;
      const res = await fetch(url);
      const data = await res.json();
      let shouldForce = false;
      if (data.last_check_time && data.check_freq) {
        const lastCheck = Date.parse(data.last_check_time);
        const now = Date.now();
        const freqMs = data.check_freq * 60 * 1000;
        if (now - lastCheck > freqMs) {
          shouldForce = true;
        }
      } else {
        shouldForce = true; // No cache, force fetch
      }
      await fetchStatus(shouldForce);
    };
    checkAndFetch();
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
    <Card sx={{ mb: 3 }}>
      <CardContent>
        {/* Session Status Header: align text and icon vertically with buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 48 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: 40 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', height: 40, mb: 0 }}>
                Session Status
              </Typography>
              {/* MAM Cookie Status Icon */}
              {status && (
                <Tooltip title={`MAM Cookie Status: ${status.mam_cookie_exists === true ? 'Valid' : (status.mam_cookie_exists === false ? 'Missing' : 'Unknown')}`}> 
                  <span style={{ display: 'flex', alignItems: 'center', marginLeft: 12 }}>
                    {status.mam_cookie_exists === true ? (
                      <CheckCircleIcon sx={{ color: 'success.main', ml: 1 }} />
                    ) : (
                      <CancelIcon sx={{ color: 'error.main', ml: 1 }} />
                    )}
                  </span>
                </Tooltip>
              )}
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
            <Tooltip title="Updates your session's IP/ASN with MAM (rate-limited to once per hour)">
              <span>
                <Button variant="contained" size="small" color="secondary" onClick={handleUpdateSeedbox} sx={{ ml: 2 }} disabled={seedboxLoading || !sessionLabel}>
                  {seedboxLoading ? 'Updating...' : 'Update Seedbox'}
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>
        {/* Network & Proxy Details Rollup */}
        {status && (
          <Accordion sx={{ mt: 2, mb: 2, border: 1, borderColor: 'divider', borderRadius: 1, boxShadow: 'none' }} defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 48 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Network & Proxy Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="dl" sx={{ m: 0, p: 0, display: 'grid', gridTemplateColumns: 'max-content auto', rowGap: 1, columnGap: 2 }}>
                <Typography component="dt" sx={{ fontWeight: 500 }}>Detected Public IP Address:</Typography>
                <Typography component="dd" sx={{ m: 0 }}>{status.detected_public_ip || "N/A"}</Typography>
                <Typography component="dt" sx={{ fontWeight: 500 }}>Detected Public ASN:</Typography>
                <Typography component="dd" sx={{ m: 0 }}>{status.detected_public_ip_asn && status.detected_public_ip_asn !== 'Unknown ASN' ? status.detected_public_ip_asn : 'N/A'}</Typography>
                <Typography component="dt" sx={{ fontWeight: 500 }}>MAM Session IP Address:</Typography>
                <Typography component="dd" sx={{ m: 0 }}>{status.current_ip || "N/A"}</Typography>
                <Typography component="dt" sx={{ fontWeight: 500 }}>MAM Session ASN:</Typography>
                <Typography component="dd" sx={{ m: 0 }}>{status.current_ip ? (status.current_ip_asn && status.current_ip_asn !== 'Unknown ASN' ? status.current_ip_asn : 'N/A') : 'N/A'}</Typography>
                <Typography component="dt" sx={{ fontWeight: 500 }}>Connection Proxied:</Typography>
                <Typography component="dd" sx={{ m: 0 }}>{status.details && status.details.proxy && status.details.proxy.host && String(status.details.proxy.host).trim() !== '' && status.details.proxy.port && String(status.details.proxy.port).trim() !== '' ? "Yes" : "No"}</Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
        {/* Robust error handling: if status is set and has error, only render the error alert */}
        {status && status.error ? (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Alert severity="error">{status.error}</Alert>
          </Box>
        ) : status ? (
          status.configured === false ? (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Alert severity="info">{status.status_message || "Session not configured. Please save session details to begin."}</Alert>
            </Box>
          ) : (
            <Box>
              {/* ...existing code... */}
              <Box>
                <Typography variant="body1">Wedge Automation: <b>{autoWedge ? "Enabled" : "Disabled"}</b></Typography>
                <Typography variant="body1">VIP Automation: <b>{autoVIP ? "Enabled" : "Disabled"}</b></Typography>
                <Typography variant="body1">Upload Automation: <b>{autoUpload ? "Enabled" : "Disabled"}</b></Typography>
              </Box>
              {status.last_check_time && (
                <>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, letterSpacing: 1 }}>
                      Next check in:
                    </Typography>
                    <Box sx={{
                      background: '#222',
                      color: '#fff',
                      px: 4,
                      py: 2,
                      borderRadius: 2,
                      fontFamily: 'monospace',
                      fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' },
                      boxShadow: 2,
                      minWidth: 220,
                      textAlign: 'center',
                      letterSpacing: 2
                    }}>
                      {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', fontWeight: 500 }}>
                    {/* Show user-friendly status message */}
                    Status: <b>{status.status_message || status.last_result || "unknown"}</b>
                  </Typography>
                  {/* MAM Details section (collapsed by default) */}
                  {status.details && status.details.raw && (
                    <Accordion sx={{ mt: 2 }} defaultExpanded={false}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>MAM Details</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box component="dl" sx={{ m: 0, p: 0, display: 'grid', gridTemplateColumns: 'max-content auto', rowGap: 1, columnGap: 2 }}>
                          <Typography component="dt" sx={{ fontWeight: 500 }}>Username:</Typography>
                          <Typography component="dd" sx={{ m: 0 }}>{status.details.raw.username ?? 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500 }}>Rank:</Typography>
                          <Typography component="dd" sx={{ m: 0 }}>{status.details.raw.classname ?? 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500 }}>Connectable:</Typography>
                          <Typography component="dd" sx={{ m: 0 }}>{status.details.raw.connectable ?? 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500 }}>Country:</Typography>
                          <Typography component="dd" sx={{ m: 0 }}>{status.details.raw.country_name ?? 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500 }}>Points:</Typography>
                          <Typography component="dd" sx={{ m: 0 }}>{status.points !== null && status.points !== undefined ? status.points : 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500 }}>Cheese:</Typography>
                          <Typography component="dd" sx={{ m: 0 }}>{status.cheese !== null && status.cheese !== undefined ? status.cheese : 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500 }}>Downloaded:</Typography>
                          <Typography component="dd" sx={{ m: 0 }}>{status.details.raw.downloaded ?? 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500 }}>Uploaded:</Typography>
                          <Typography component="dd" sx={{ m: 0 }}>{status.details.raw.uploaded ?? 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500 }}>Ratio:</Typography>
                          <Typography component="dd" sx={{ m: 0 }}>{status.details.raw.ratio ?? 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500 }}>Seeding:</Typography>
                          <Typography component="dd" sx={{ m: 0 }}>{status.details.raw.sSat && typeof status.details.raw.sSat.count === 'number' ? status.details.raw.sSat.count : 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500 }}>Unsatisfied:</Typography>
                          <Typography component="dd" sx={{ m: 0 }}>{status.details.raw.unsat && typeof status.details.raw.unsat.count === 'number' ? status.details.raw.unsat.count : 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500 }}>Unsatisfied Limit:</Typography>
                          <Typography component="dd" sx={{ m: 0 }}>{status.details.raw.unsat && typeof status.details.raw.unsat.limit === 'number' ? status.details.raw.unsat.limit : 'N/A'}</Typography>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </>
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
            <Alert severity={
              seedboxStatus.success
                ? 'success'
                : (seedboxStatus.error && seedboxStatus.error.toLowerCase().includes('asn mismatch')
                    ? 'error'
                    : (seedboxStatus.error && seedboxStatus.error.includes('Rate limit') ? 'info' : 'warning'))
            }>
              {seedboxStatus.success && seedboxStatus.msg && seedboxStatus.msg.toLowerCase().includes('no change') && (
                <>No change: IP/ASN already set.</>
              )}
              {seedboxStatus.success && seedboxStatus.msg && !seedboxStatus.msg.toLowerCase().includes('no change') && (
                <>Seedbox update successful!</>
              )}
              {!seedboxStatus.success && seedboxStatus.error && seedboxStatus.error.toLowerCase().includes('asn mismatch') && (
                <>
                  <b>ASN mismatch:</b> The ASN detected by MouseTrap does not match the ASN expected by MAM.<br />
                  <span style={{ color: '#d32f2f' }}>{seedboxStatus.error}</span><br />
                  <span style={{ fontSize: 13 }}>
                    Please ensure your session is valid for this ASN, or try updating your session/cookie.
                  </span>
                </>
              )}
              {!seedboxStatus.success && seedboxStatus.error && seedboxStatus.error.includes('Rate limit') && (
                <>
                  Rate limited: Please wait before updating again.<br />
                  {seedboxStatus.error.match(/\d+/) && (
                    <RateLimitTimer minutes={parseInt(seedboxStatus.error.match(/\d+/)[0], 10)} />
                  )}
                </>
              )}
              {!seedboxStatus.success && !seedboxStatus.error?.toLowerCase().includes('asn mismatch') && (!seedboxStatus.error || !seedboxStatus.error.includes('Rate limit')) && (
                <>{seedboxStatus.error || 'Seedbox update failed.'}</>
              )}
            </Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

export default StatusCard;

// Utility to robustly stringify any message for snackbars
function stringifyMessage(msg) {
  if (typeof msg === 'string') return msg;
  if (msg instanceof Error) return msg.message;
  if (msg === undefined || msg === null) return '';
  try {
    return JSON.stringify(msg);
  } catch {
    return String(msg);
  }
}

// Live rate limit timer component
function RateLimitTimer({ minutes }) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  return <span>Time remaining: <b>{min}m {sec}s</b></span>;
}
