import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, Typography, Box, Snackbar, Alert, Divider, Button, Tooltip, IconButton } from "@mui/material";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
  // Helper to extract ASN number and provide tooltip for full AS string
  const renderASN = (asn, fullAs) => {
    let asnNum = asn;
    const match = asn && typeof asn === 'string' ? asn.match(/(AS)?(\d+)/i) : null;
    if (match) asnNum = match[2];
    return (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {asnNum || 'N/A'}
        {fullAs && (
          <Tooltip title={fullAs} arrow>
            <IconButton size="small" sx={{ ml: 0.5, p: 0.2 }}>
              <InfoOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        )}
      </span>
    );
  };

const StatusCard = forwardRef(function StatusCard({ autoWedge, autoVIP, autoUpload, setDetectedIp, setPoints, setCheese, sessionLabel, onSessionSaved, onSessionDataChanged, onStatusUpdate }, ref) {
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
          lastStatusMsg = status.status_message;
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
  useEffect(() => {
    if (!sessionLabel) return;
    setStatus(null); // Clear status to show loading/blank until check completes
    fetchStatus(true);
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
        {/* Network & Proxy Details Rollup */}
        {status && (
          <Accordion sx={{ mt: 2, mb: 2 }} defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Network & Proxy Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="dl" sx={{ m: 0, p: 0, display: 'grid', gridTemplateColumns: 'max-content auto', rowGap: 0.5, columnGap: 2 }}>
                <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Detected Public IP Address:</Typography>
                <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.detected_public_ip || "N/A"}</Typography>
                <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Detected Public ASN:</Typography>
                <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>
                  {renderASN(status.detected_public_ip_asn, status.detected_public_ip_as)}
                </Typography>
                <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Proxied Public IP Address:</Typography>
                <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.proxied_public_ip || "N/A"}</Typography>
                <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Proxied Public ASN:</Typography>
                <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>
                  {renderASN(status.proxied_public_ip_asn, status.proxied_public_ip_as)}
                </Typography>
                <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>MAM Session IP Address:</Typography>
                <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.current_ip || "N/A"}</Typography>
                <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>MAM Session ASN:</Typography>
                <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>
                  {status.current_ip ? renderASN(status.current_ip_asn, status.mam_session_as) : 'N/A'}
                </Typography>
                <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Connection Proxied:</Typography>
                <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.details && status.details.proxy && status.details.proxy.host && String(status.details.proxy.host).trim() !== '' && status.details.proxy.port && String(status.details.proxy.port).trim() !== '' ? "Yes" : "No"}</Typography>
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
              {/* Timer, status message, and automation row (single instance) */}
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
                    {/* Unified, styled status message */}
                    {(() => {
                      const msg = status.status_message || status.last_result || "unknown";
                      let color = 'text.primary';
                      let severity = 'info';
                      // If the backend returned a rate limit message with minutes, display it exactly
                      if (msg.match(/Rate limit: last change too recent\. Try again in (\d+) minutes\./i)) {
                        color = 'warning.main'; severity = 'warning';
                      } else if (/update successful|no change detected|asn changed, no seedbox update needed/i.test(msg)) {
                        color = 'success.main'; severity = 'success';
                      } else if (/rate limit|rate-limited|change detected\. rate limited/i.test(msg)) {
                        color = 'warning.main'; severity = 'warning';
                      } else if (/update failed|error|forbidden|failed/i.test(msg)) {
                        color = 'error.main'; severity = 'error';
                      } else if (/not needed|no update attempted/i.test(msg)) {
                        color = 'text.secondary'; severity = 'info';
                      }
                      return (
                        <Box sx={{ mt: 1, textAlign: 'center' }}>
                          <Typography variant="subtitle2" color={color} sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                            {msg}
                          </Typography>
                        </Box>
                      );
                    })()}
                  </Typography>
                  {/* Automation row (restored, below status message) */}
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 1 }}>Automation:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Wedge:</Typography>
                        {autoWedge ? (
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 22, position: 'relative', top: '-1px' }} />
                        ) : (
                          <CancelIcon sx={{ color: 'error.main', fontSize: 22, position: 'relative', top: '-1px' }} />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>VIP Time:</Typography>
                        {autoVIP ? (
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 22, position: 'relative', top: '-1px' }} />
                        ) : (
                          <CancelIcon sx={{ color: 'error.main', fontSize: 22, position: 'relative', top: '-1px' }} />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Upload Credit:</Typography>
                        {autoUpload ? (
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 22, position: 'relative', top: '-1px' }} />
                        ) : (
                          <CancelIcon sx={{ color: 'error.main', fontSize: 22, position: 'relative', top: '-1px' }} />
                        )}
                      </Box>
                    </Box>
                  </Box>
                  {/* MAM Details section (collapsed by default) */}
                  {status.details && status.details.raw && (
                    <Accordion sx={{ mt: 2 }} defaultExpanded={false}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>MAM Details</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box component="dl" sx={{ m: 0, p: 0, display: 'grid', gridTemplateColumns: 'max-content auto', rowGap: 0.5, columnGap: 2 }}>
                          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Username:</Typography>
                          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.details.raw.username ?? 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>UID:</Typography>
                          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.details.raw.uid ?? 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Rank:</Typography>
                          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.details.raw.classname ?? 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Connectable:</Typography>
                          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.details.raw.connectable ?? 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Country:</Typography>
                          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.details.raw.country_name ?? 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Points:</Typography>
                          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.points !== null && status.points !== undefined ? status.points : 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Cheese:</Typography>
                          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.cheese !== null && status.cheese !== undefined ? status.cheese : 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Downloaded:</Typography>
                          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.details.raw.downloaded ?? 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Uploaded:</Typography>
                          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.details.raw.uploaded ?? 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Ratio:</Typography>
                          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.details.raw.ratio ?? 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Seeding:</Typography>
                          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.details.raw.sSat && typeof status.details.raw.sSat.count === 'number' ? status.details.raw.sSat.count : 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Unsatisfied:</Typography>
                          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.details.raw.unsat && typeof status.details.raw.unsat.count === 'number' ? status.details.raw.unsat.count : 'N/A'}</Typography>
                          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Unsatisfied Limit:</Typography>
                          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.details.raw.unsat && typeof status.details.raw.unsat.limit === 'number' ? status.details.raw.unsat.limit : 'N/A'}</Typography>
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
