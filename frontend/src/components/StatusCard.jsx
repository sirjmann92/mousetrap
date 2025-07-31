import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

export default function StatusCard({ autoWedge, autoVIP, autoUpload, setDetectedIp }) {
  const [status, setStatus] = useState(null);
  const [timer, setTimer] = useState(0);

  // Fetch status from backend every 5 seconds
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/status");
        const data = await res.json();
        // Map backend fields to expected frontend fields
        const detectedIp = data.detected_public_ip || data.current_ip || "";
        setStatus({
          last_update_mamid: data.mam_id || "",
          last_update_time: Date.now() / 1000, // fallback if not provided
          ratelimited: 0, // fallback if not provided
          last_result: data.message || "",
          ip: detectedIp,
          asn: data.asn || "",
        });
        if (setDetectedIp) setDetectedIp(detectedIp);
      } catch (e) {
        setStatus(null);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [setDetectedIp]);

  // Countdown to next allowed check
  useEffect(() => {
    if (!status || !status.last_update_time) return;
    const getSecondsLeft = () => {
      const lastUpdate = status.last_update_time * 1000; // unix timestamp in seconds
      const cooldown = status.ratelimited ?? 0;
      const now = Date.now();
      const nextCheck = lastUpdate + cooldown * 1000;
      return Math.max(0, Math.floor((nextCheck - now) / 1000));
    };
    setTimer(getSecondsLeft());
    const interval = setInterval(() => setTimer(getSecondsLeft()), 1000);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Status</Typography>
        {status ? (
          <Box sx={{ ml: 2 }}>
            <Typography variant="body1">MaM Cookie: <b>{status.last_update_mamid || "Missing"}</b></Typography>
            <Typography variant="body1">Points: <b>N/A</b></Typography>
            <Typography variant="body1">Wedge Automation: <b>{autoWedge ? "Enabled" : "Disabled"}</b></Typography>
            <Typography variant="body1">VIP Automation: <b>{autoVIP ? "Enabled" : "Disabled"}</b></Typography>
            <Typography variant="body1">Upload Automation: <b>{autoUpload ? "Enabled" : "Disabled"}</b></Typography>
            <Typography variant="body1">Current IP: <b>{status.ip}</b></Typography>
            <Typography variant="body1">ASN: <b>{status.asn}</b></Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Last check: <b>{new Date(status.last_update_time * 1000).toLocaleString()}</b><br />
              Previous result: <b>{status.last_result || "unknown"}</b><br />
              {timer > 0
                ? <>Next check in: <b>{Math.floor(timer / 60)}m {timer % 60}s</b></>
                : <>Ready for next check!</>
              }
            </Typography>
          </Box>
        ) : (
          <Typography color="error">Status unavailable</Typography>
        )}
      </CardContent>
    </Card>
  );
}
