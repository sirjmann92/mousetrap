import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, Typography, Box, Snackbar, Alert, Divider, Button } from "@mui/material";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const StatusCard = forwardRef(function StatusCard({ autoWedge, autoVIP, autoUpload, autoMillionairesVault, setDetectedIp, setPoints, setCheese, sessionLabel }, ref) {
  const [status, setStatus] = useState(null);
  const [timer, setTimer] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
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
        asn: data.asn || "",
        last_check_time: data.last_check_time || null,
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

  // Timer logic: always use latest backend data, update instantly on session change
  useEffect(() => {
    let interval;
    if (status && status.last_check_time && status.check_freq) {
      const updateTimer = () => {
        const lastCheck = Date.parse(status.last_check_time);
        const now = Date.now();
        let secondsLeft;
        if (status.ratelimit && status.ratelimit > 0) {
          secondsLeft = status.ratelimit - Math.floor((now - lastCheck) / 1000);
        } else {
          secondsLeft = status.check_freq * 60 - Math.floor((now - lastCheck) / 1000);
        }
        secondsLeft = Math.max(0, secondsLeft);
        setTimer(secondsLeft);
        // Auto-fetch when timer hits zero
        if (secondsLeft === 0) {
          fetchStatus();
        }
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setTimer(0);
    }
    return () => interval && clearInterval(interval);
  }, [status && status.last_check_time, status && status.check_freq, status && status.ratelimit, sessionLabel]);

  // Polling effect: only one interval, always uses backend check_freq
  useEffect(() => {
    fetchStatus();
    if (pollingRef.current) clearInterval(pollingRef.current);
    const intervalMs = (status && status.check_freq ? status.check_freq : 1) * 60000;
    pollingRef.current = setInterval(() => fetchStatus(), intervalMs);
    return () => clearInterval(pollingRef.current);
  }, [setDetectedIp, status && status.check_freq, sessionLabel]);

  // Handler for 'Check Now' button
  const handleCheckNow = async () => {
    await fetchStatus(true);
    setSnackbar({ open: true, message: 'Checked now!', severity: 'success' });
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" gutterBottom>Status</Typography>
          <Button variant="outlined" size="small" onClick={handleCheckNow} sx={{ ml: 2 }}>
            Check Now
          </Button>
        </Box>
        {status ? (
          <Box>
            {/* Top section: ASN, IP Address, MAM Cookie Status */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">ASN: <b>{status.asn && status.asn !== 'Unknown ASN' ? status.asn : 'N/A'}</b></Typography>
              <Typography variant="body1">IP Address: <b>{status.ip}</b></Typography>
              <Typography variant="body1">MAM Cookie Status: <b>{status.last_update_mamid || "Missing"}</b></Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            {/* Bottom section: MAM details, Points, Automations */}
            <Box>
              <Typography variant="body1">Points: <b>{status.points !== null && status.points !== undefined ? status.points : "N/A"}</b></Typography>
              <Typography variant="body1">Cheese: <b>{status.cheese !== null && status.cheese !== undefined ? status.cheese : "N/A"}</b></Typography>
              <Typography variant="body1">Wedge Automation: <b>{autoWedge ? "Enabled" : "Disabled"}</b></Typography>
              <Typography variant="body1">VIP Automation: <b>{autoVIP ? "Enabled" : "Disabled"}</b></Typography>
              <Typography variant="body1">Upload Automation: <b>{autoUpload ? "Enabled" : "Disabled"}</b></Typography>
              <Typography variant="body1">Millionaire's Vault Automation: <b>{autoMillionairesVault ? "Enabled" : "Disabled"}</b></Typography>
            </Box>
            {status.last_check_time && (
              <>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {status.ratelimit && status.ratelimit > 0 ? (
                    <>Ratelimit: <b>{Math.floor(timer / 60)}m {timer % 60}s</b></>
                  ) : (
                    <>Next check in: <b>{Math.floor(timer / 60)}m {timer % 60}s</b></>
                  )}
                  <br />
                  {/* Show user-friendly status message */}
                  Status: <b>{status.status_message || status.last_result || "unknown"}</b>
                </Typography>
                {/* Expandable section for raw backend details */}
                {status.details && Object.keys(status.details).length > 0 && (
                  <Accordion sx={{ mt: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="caption">More info</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <pre style={{ fontSize: 12, margin: 0 }}>{JSON.stringify(status.details, null, 2)}</pre>
                    </AccordionDetails>
                  </Accordion>
                )}
              </>
            )}
          </Box>
        ) : (
          <Typography color="error">Status unavailable</Typography>
        )}
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
});

export default StatusCard;
