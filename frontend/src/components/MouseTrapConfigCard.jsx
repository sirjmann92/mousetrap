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
  IconButton,
  Collapse
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

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
  const [expanded, setExpanded] = useState(false);

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
      setTimeout(() => setSaveStatus(""), 2000); // Auto-dismiss after 2s
      // Trigger status refresh after save
      if (window.statusCardFetchStatus) window.statusCardFetchStatus();
    } catch (err) {
      setSaveError("Error saving config: " + err.message);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" gutterBottom>Session Configuration</Typography>
          <IconButton onClick={() => setExpanded(e => !e)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expanded}>
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
              <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Session Type</InputLabel>
                <Select
                  value={sessionType}
                  label="Session Type"
                  onChange={e => setSessionType(e.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="IP Locked">IP Locked</MenuItem>
                  <MenuItem value="ASN Locked">ASN Locked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="IP Address"
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
              </Box>
              <Typography variant="caption" color="text.secondary">
                Enter IP address associated with above MaM ID.
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
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
        </Collapse>
      </CardContent>
    </Card>
  );
}
