import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, Typography, Box, Snackbar, Alert, Divider, Button } from "@mui/material";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Tooltip from '@mui/material/Tooltip';

const StatusCard = forwardRef(function StatusCard({ autoWedge, autoVIP, autoUpload, autoMillionairesVault, setDetectedIp, setPoints, setCheese, sessionLabel }, ref) {
  const [status, setStatus] = useState(null);
  const [timer, setTimer] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [seedboxStatus, setSeedboxStatus] = useState(null);
  const [seedboxLoading, setSeedboxLoading] = useState(false);
  const pollingRef = useRef();
  const lastCheckRef = useRef(null);

  // Fetch status from backend
  const fetchStatus = async (force = false) => {
    try {
      let url = sessionLabel ? `/api/status?label=${encodeURIComponent(sessionLabel)}` : "/api/status";
      if (force) url += (url.includes('?') ? '&' : '?') + 'force=1';
      const res = await fetch(url);
      const data = await res.json();
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
      setStatus(null);
      if (setPoints) setPoints(null);
      if (setCheese) setCheese(null);
    }
  };

  useImperativeHandle(ref, () => ({ fetchStatus }));

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
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setTimer(0);
    }
    return () => interval && clearInterval(interval);
  }, [status && status.next_check_time, sessionLabel]);

  // Always fetch status immediately after config save or session change
  useEffect(() => {
    fetchStatus();
  }, [sessionLabel]);

  // Polling effect: only one interval, always uses backend check_freq
  useEffect(() => {
    fetchStatus();
    if (pollingRef.current) clearInterval(pollingRef.current);
    const intervalMs = (status && status.check_freq ? status.check_freq : 1) * 60000;
    pollingRef.current = setInterval(() => fetchStatus(), intervalMs);
    return () => clearInterval(pollingRef.current);
  }, [setDetectedIp, status && status.check_freq, sessionLabel]);

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

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" gutterBottom>Status</Typography>
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
        {status ? (
          <Box>
            {/* Top section: IPs and ASNs */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                MAM Session IP Address: <b>{status.current_ip || "N/A"}</b>
              </Typography>
              <Typography variant="body1">
                MAM Session ASN: <b>{status.current_ip ? (status.current_ip_asn && status.current_ip_asn !== 'Unknown ASN' ? status.current_ip_asn : 'N/A') : 'N/A'}</b>
              </Typography>
              <Typography variant="body1">
                Detected Public IP Address: <b>{status.detected_public_ip || "N/A"}</b>
              </Typography>
              <Typography variant="body1">
                Detected Public ASN: <b>{status.detected_public_ip ? (status.detected_public_ip_asn && status.detected_public_ip_asn !== 'Unknown ASN' ? status.detected_public_ip_asn : 'N/A') : 'N/A'}</b>
              </Typography>
              <Typography variant="body1">MAM Cookie Status: <b>{status.mam_cookie_exists === true ? "Valid" : "Missing"}</b></Typography>
              {/* Proxy config display */}
              <Typography variant="body1">
                Connection Proxied: <b>{status.details && status.details.proxy && status.details.proxy.host && String(status.details.proxy.host).trim() !== '' && status.details.proxy.port && String(status.details.proxy.port).trim() !== '' ? "Yes" : "No"}</b>
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            {/* Bottom section: MAM details, Points, Automations */}
            <Box>
              {/* Removed Points and Cheese from here, now in MAM Details */}
              <Typography variant="body1">Wedge Automation: <b>{autoWedge ? "Enabled" : "Disabled"}</b></Typography>
              <Typography variant="body1">VIP Automation: <b>{autoVIP ? "Enabled" : "Disabled"}</b></Typography>
              <Typography variant="body1">Upload Automation: <b>{autoUpload ? "Enabled" : "Disabled"}</b></Typography>
              <Typography variant="body1">Millionaire's Vault Automation: <b>{autoMillionairesVault ? "Enabled" : "Disabled"}</b></Typography>
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
        ) : (
          <Typography color="error">Status unavailable</Typography>
        )}
        <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
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
