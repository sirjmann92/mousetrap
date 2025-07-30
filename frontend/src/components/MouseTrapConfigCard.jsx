import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Alert,
} from "@mui/material";

export default function MouseTrapConfigCard({
  mamId, setMamId,
  sessionType, setSessionType,
  mamIp, setMamIp,
  detectedIp,
  currentASN,
  checkFrequency, setCheckFrequency
}) {
  // New: Local state for save status
  const [saveStatus, setSaveStatus] = useState("");
  const [saveError, setSaveError] = useState("");

  // Load config from backend on mount
  useEffect(() => {
    fetch("/api/config")
      .then(res => {
        if (!res.ok) throw new Error("Unable to load config");
        return res.json();
      })
      .then(cfg => {
        setMamId(cfg?.mam?.mam_id ?? "");
        setSessionType(cfg?.mam?.session_type ?? "ASN Locked");
        setMamIp(cfg?.mam_ip ?? "");
        setCheckFrequency(cfg?.check_freq ?? 5);
      })
      .catch(err => {
        setSaveError("Failed to load config: " + err.message);
      });
    // eslint-disable-next-line
  }, []);

  // Save config handler
  const handleSave = async () => {
    setSaveStatus("");
    setSaveError("");
    const payload = {
      mam: {
        mam_id: mamId,
        session_type: sessionType
      },
      mam_ip: mamIp,
      check_freq: checkFrequency
    };
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save config");
      setSaveStatus("Configuration saved successfully.");
    } catch (err) {
      setSaveError("Error saving config: " + err.message);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>MouseTrap Configuration</Typography>
        {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
        {saveStatus && <Alert severity="success" sx={{ mb: 2 }}>{saveStatus}</Alert>}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              label="MaM ID"
              value={mamId}
              onChange={e => setMamId(e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Session Type</InputLabel>
              <Select
                value={sessionType}
                label="Session Type"
                onChange={e => setSessionType(e.target.value)}
              >
                <MenuItem value="IP Locked">IP Locked</MenuItem>
                <MenuItem value="ASN Locked">ASN Locked</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="MaM IP (override)"
              value={mamIp}
              placeholder="e.g. 203.0.113.99"
              onChange={e => setMamIp(e.target.value)}
              size="small"
              fullWidth
            />
            <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setMamIp(detectedIp)}
                sx={{ mr: 1 }}
              >
                Use Detected Public IP
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                Detected Public IP: <b>{detectedIp}</b>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ASN: <b>{currentASN || "N/A"}</b>
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Leave blank to use detected IP, or enter your VPN/public IP if you want MouseTrap to override.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Check Frequency (min)</InputLabel>
              <Select
                value={checkFrequency}
                label="Check Frequency (min)"
                onChange={e => setCheckFrequency(Number(e.target.value))}
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              How often to check and update IP/ASN (minutes)
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ textAlign: "right", mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            SAVE
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
