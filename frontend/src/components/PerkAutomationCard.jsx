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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function PerkAutomationCard({
  buffer, setBuffer,
  wedgeHours, setWedgeHours,
  autoWedge, setAutoWedge,
  autoVIP, setAutoVIP,
  autoUpload, setAutoUpload,
  points
}) {
  const [expanded, setExpanded] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [uploadAmount, setUploadAmount] = useState(1);
  const [vipWeeks, setVipWeeks] = useState(4);
  const [wedgeMethod, setWedgeMethod] = useState("points");

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
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', px: 2, pt: 2, pb: 1.5, minHeight: 56 }} onClick={() => setExpanded(e => !e)}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Perk Automation Options
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>Points: <b>{points !== null ? points : "N/A"}</b></Typography>
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
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Upload Credit Amount</InputLabel>
                <Select
                  value={uploadAmount}
                  label="Upload Credit Amount"
                  onChange={e => setUploadAmount(e.target.value)}
                >
                  <MenuItem value={1}>1 GB (500 points)</MenuItem>
                  <MenuItem value={2.5}>2.5 GB (1250 points)</MenuItem>
                  <MenuItem value={5}>5 GB (2500 points)</MenuItem>
                  <MenuItem value={20}>20 GB (10,000 points)</MenuItem>
                  <MenuItem value={100}>100 GB (50,000 points)</MenuItem>
                  <MenuItem value={"Max Affordable"}>All I can afford</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>VIP Weeks</InputLabel>
                <Select
                  value={vipWeeks}
                  label="VIP Weeks"
                  onChange={e => setVipWeeks(e.target.value)}
                >
                  <MenuItem value={4}>4 Weeks (5,000 points)</MenuItem>
                  <MenuItem value={8}>8 Weeks (10,000 points)</MenuItem>
                  <MenuItem value={"max"}>Max me out!</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Wedge Method</InputLabel>
                <Select
                  value={wedgeMethod}
                  label="Wedge Method"
                  onChange={e => setWedgeMethod(e.target.value)}
                >
                  <MenuItem value={"points"}>Via Points (50,000 points)</MenuItem>
                  <MenuItem value={"cheese"}>Via Cheese (5 cheese)</MenuItem>
                </Select>
              </FormControl>
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
        </CardContent>
      </Collapse>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
}