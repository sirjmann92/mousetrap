import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, Typography, Box, Snackbar, Alert, Divider } from "@mui/material";

export default function StatusCard({ autoWedge, autoVIP, autoUpload, autoMillionairesVault, setDetectedIp, setPoints }) {
  const [status, setStatus] = useState(null);
  const [timer, setTimer] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const pollingRef = useRef();
  const lastCheckRef = useRef(null);

  // Fetch status from backend
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status");
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
      });
      if (setDetectedIp) setDetectedIp(detectedIp);
      if (setPoints) setPoints(data.points || null);
    } catch (e) {
      setStatus(null);
      if (setPoints) setPoints(null);
    }
  };

  // Polling effect: only one interval
  useEffect(() => {
    fetchStatus();
    pollingRef.current = setInterval(fetchStatus, 60000); // 1 minute
    return () => clearInterval(pollingRef.current);
  }, [setDetectedIp]);

  // Countdown to next allowed check, only reset if last_check_time changes
  useEffect(() => {
    if (!status || !status.last_check_time) return;
    if (lastCheckRef.current === status.last_check_time) return;
    lastCheckRef.current = status.last_check_time;
    let secondsLeft = 0;
    const lastCheck = Date.parse(status.last_check_time);
    const now = Date.now();
    if (status.ratelimit && status.ratelimit > 0) {
      secondsLeft = status.ratelimit - Math.floor((now - lastCheck) / 1000);
    } else {
      secondsLeft = status.check_freq * 60 - Math.floor((now - lastCheck) / 1000);
    }
    secondsLeft = Math.max(0, secondsLeft);
    setTimer(secondsLeft);
    const interval = setInterval(() => {
      setTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [status && status.last_check_time]);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Status</Typography>
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
              <Typography variant="body1">Wedge Automation: <b>{autoWedge ? "Enabled" : "Disabled"}</b></Typography>
              <Typography variant="body1">VIP Automation: <b>{autoVIP ? "Enabled" : "Disabled"}</b></Typography>
              <Typography variant="body1">Upload Automation: <b>{autoUpload ? "Enabled" : "Disabled"}</b></Typography>
              <Typography variant="body1">Millionaire's Vault Automation: <b>{autoMillionairesVault ? "Enabled" : "Disabled"}</b></Typography>
            </Box>
            {status.last_check_time && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {status.ratelimit && status.ratelimit > 0 ? (
                  <>Ratelimit: <b>{Math.floor(timer / 60)}m {timer % 60}s</b></>
                ) : (
                  <>Next check in: <b>{Math.floor(timer / 60)}m {timer % 60}s</b></>
                )}
                <br />
                Previous result: <b>{status.last_result || "unknown"}</b>
              </Typography>
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
}
