import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Grid, Paper, Box, Typography, Button, Checkbox, FormControlLabel,
  TextField, Divider, Select, MenuItem, Snackbar, Alert
} from "@mui/material";

export default function MouseTrapConfig() {
  // ----- State -----
  const [formData, setFormData] = useState({
    mamId: "",
    asn: "locked",
    mamIp: "",
    buffer: "",
    wedgeHours: "",
    autoWedge: false,
    autoVIP: false,
    autoUpload: false
  });
  const [status, setStatus] = useState({});
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ----- Fetch Initial Data -----
  useEffect(() => {
    axios.get("/api/config")
      .then(res => {
        setFormData(res.data.config);
        setStatus(res.data.status);
        setNotification(res.data.notification);
        setLoading(false);
      })
      .catch(err => { setLoading(false); setSaveError("Failed to load config"); });
  }, []);

  // ----- Handle Form Change -----
  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ----- Handle Save -----
  const handleSave = () => {
    setSaveError("");
    axios.post("/api/config", formData)
      .then(() => setSaveSuccess(true))
      .catch(() => setSaveError("Failed to save config"));
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={3} sx={{ p: 3 }}>
          {/* Status */}
          <Box mb={2}>
            <Typography variant="h5">🛠 MouseTrap</Typography>
            <Typography variant="subtitle1" fontWeight="bold">Status</Typography>
            <Typography variant="body2">
              MaM Cookie: {status.cookie || "Missing"}<br />
              Points: {status.points || "N/A"}<br />
              VIP Automation: {status.vip || "N/A"}<br />
              Current IP: <a href="#">{status.ip || "N/A"}</a><br />
              ASN: {status.asn || "N/A"}<br />
              <span style={{ color: "#888" }}>
                {status.mamId ? "" : "Please provide your MaM ID in the configuration."}
              </span>
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {/* Config Form */}
          <Typography variant="h6" mb={2}>MouseTrap Configuration</Typography>
          <TextField
            fullWidth label="MaM ID"
            value={formData.mamId}
            onChange={handleChange("mamId")}
            sx={{ mb: 2 }}
          />
          <Select
            fullWidth value={formData.asn}
            onChange={handleChange("asn")}
            sx={{ mb: 2 }}
          >
            <MenuItem value="locked">ASN Locked</MenuItem>
            {/* Add more ASN options if needed */}
          </Select>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth label="MaM IP (override)"
                value={formData.mamIp}
                onChange={handleChange("mamIp")}
              />
              <Typography variant="caption" color="text.secondary">
                Detected Public IP: {status.ip || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: { xs: 2, md: 0 } }}
                // Example: could wire up to backend to auto-fill IP
                onClick={() => setFormData(prev => ({ ...prev, mamIp: status.ip }))}
              >
                Use Detected Public IP
              </Button>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />

          {/* Perk Automation Options */}
          <Typography variant="h6" mb={2}>Perk Automation Options</Typography>
          <TextField
            fullWidth label="Buffer (points to keep)"
            value={formData.buffer}
            onChange={handleChange("buffer")}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth label="Wedge Hours (frequency)"
            value={formData.wedgeHours}
            onChange={handleChange("wedgeHours")}
            sx={{ mb: 2 }}
          />
          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <FormControlLabel
              control={<Checkbox checked={formData.autoWedge} onChange={handleChange("autoWedge")} />}
              label="Enable Wedge Auto Purchase"
            />
            <FormControlLabel
              control={<Checkbox checked={formData.autoVIP} onChange={handleChange("autoVIP")} />}
              label="Enable VIP Auto Purchase"
            />
            <FormControlLabel
              control={<Checkbox checked={formData.autoUpload} onChange={handleChange("autoUpload")} />}
              label="Enable Upload Credit Auto Purchase"
            />
          </Box>
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
          </Box>
        </Paper>
      </Grid>

      {/* Right column: Notifications */}
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6">Notifications</Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            {notification || "Configure email and webhook notifications here. (Coming soon!)"}
          </Typography>
        </Paper>
      </Grid>

      {/* Success/Error Snackbar */}
      <Snackbar open={!!saveSuccess || !!saveError} autoHideDuration={4000} onClose={() => { setSaveSuccess(false); setSaveError(""); }}>
        {saveSuccess ? (
          <Alert severity="success">Configuration saved!</Alert>
        ) : saveError ? (
          <Alert severity="error">{saveError}</Alert>
        ) : null}
      </Snackbar>
    </Grid>
  );
}
