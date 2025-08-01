import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Button,
  Tooltip,
  IconButton,
  Collapse,
  Snackbar,
  Alert
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function PerkAutomationCard({
  buffer, setBuffer,
  wedgeHours, setWedgeHours,
  autoWedge, setAutoWedge,
  autoVIP, setAutoVIP,
  autoUpload, setAutoUpload
}) {
  const [expanded, setExpanded] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // API call helpers
  const triggerWedge = async () => {
    try {
      const res = await fetch("/api/automation/wedge", { method: "POST" });
      const data = await res.json();
      if (data.success) setSnackbar({ open: true, message: "Wedge automation triggered!", severity: 'success' });
      else setSnackbar({ open: true, message: data.error || "Wedge automation failed", severity: 'error' });
    } catch (e) {
      setSnackbar({ open: true, message: "Wedge automation failed", severity: 'error' });
    }
  };
  const triggerVIP = async () => {
    try {
      const res = await fetch("/api/automation/vip", { method: "POST" });
      const data = await res.json();
      if (data.success) setSnackbar({ open: true, message: "VIP automation triggered!", severity: 'success' });
      else setSnackbar({ open: true, message: data.error || "VIP automation failed", severity: 'error' });
    } catch (e) {
      setSnackbar({ open: true, message: "VIP automation failed", severity: 'error' });
    }
  };
  const triggerUpload = async () => {
    try {
      const res = await fetch("/api/automation/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gb: 1 }) // Default to 1GB
      });
      const data = await res.json();
      if (data.success) setSnackbar({ open: true, message: "Upload automation triggered!", severity: 'success' });
      else setSnackbar({ open: true, message: data.error || "Upload automation failed", severity: 'error' });
    } catch (e) {
      setSnackbar({ open: true, message: "Upload automation failed", severity: 'error' });
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" gutterBottom>Perk Automation Options</Typography>
          <IconButton onClick={() => setExpanded(e => !e)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expanded}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Buffer (points to keep)"
                type="number"
                value={buffer}
                onChange={e => setBuffer(Number(e.target.value))}
                size="small"
                fullWidth
                helperText="Points to maintain as safety buffer"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Wedge Hours (frequency)"
                type="number"
                value={wedgeHours}
                onChange={e => setWedgeHours(Number(e.target.value))}
                size="small"
                fullWidth
                helperText="Hours between wedge purchases"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* Wedge Auto Purchase */}
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoWedge}
                      onChange={e => setAutoWedge(e.target.checked)}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      Enable Wedge Auto Purchase
                      <Tooltip title="Automatically purchase freeleech wedges" arrow>
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
              {/* VIP Auto Purchase */}
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoVIP}
                      onChange={e => setAutoVIP(e.target.checked)}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      Enable VIP Auto Purchase
                      <Tooltip title="Automatically purchase VIP status" arrow>
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
              {/* Upload Credit Auto Purchase */}
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoUpload}
                      onChange={e => setAutoUpload(e.target.checked)}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      Enable Upload Credit Auto Purchase
                      <Tooltip title="Automatically purchase upload credits" arrow>
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="contained" color="primary" onClick={triggerWedge}>Trigger Wedge</Button>
                <Button variant="contained" color="secondary" onClick={triggerVIP}>Trigger VIP</Button>
                <Button variant="contained" color="success" onClick={triggerUpload}>Trigger Upload</Button>
              </Box>
            </Grid>
          </Grid>
        </Collapse>
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
}