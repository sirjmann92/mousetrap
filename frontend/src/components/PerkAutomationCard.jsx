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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

function MillionairesVaultAmountDropdown({ value, onChange, minWidth }) {
  return (
    <FormControl fullWidth size="small" sx={{ mb: 2, minWidth: minWidth || 180 }}>
      <InputLabel>Millionaire's Vault Amount</InputLabel>
      <Select
        value={value}
        label="Millionaire's Vault Amount"
        onChange={onChange}
        sx={minWidth ? { minWidth } : {}}
      >
        {[...Array(20)].map((_, i) => {
          const val = (i + 1) * 100;
          return <MenuItem key={val} value={val}>{val.toLocaleString()} points</MenuItem>;
        })}
      </Select>
    </FormControl>
  );
}

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
  const [autoMillionairesVault, setAutoMillionairesVault] = useState(false);
  const [millionairesVaultAmount, setMillionairesVaultAmount] = useState(2000);

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
  const triggerMillionairesVault = async () => {
    try {
      const res = await fetch("/api/automation/millionaires_vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: millionairesVaultAmount })
      });
      const data = await res.json();
      if (data.success) setSnackbar({ open: true, message: "Millionaire's Vault donation triggered!", severity: 'success' });
      else setSnackbar({ open: true, message: data.error || "Millionaire's Vault donation failed", severity: 'error' });
    } catch (e) {
      setSnackbar({ open: true, message: "Millionaire's Vault donation failed", severity: 'error' });
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
                inputProps={{ style: { width: 60 } }} // Decrease width by ~5 chars
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
            <Grid item xs={12} sm={4}>
              <MillionairesVaultAmountDropdown
                value={millionairesVaultAmount}
                onChange={e => setMillionairesVaultAmount(Number(e.target.value))}
                minWidth={180}
              />
            </Grid>
          </Grid>
          <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
            <FormControlLabel
              control={<Checkbox checked={autoUpload} onChange={e => setAutoUpload(e.target.checked)} />}
              label={
                <span>
                  Auto Upload Credit
                  <Tooltip title="Automatically spend Upload Credit when available">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </span>
              }
            />
            <FormControlLabel
              control={<Checkbox checked={autoVIP} onChange={e => setAutoVIP(e.target.checked)} />}
              label={
                <span>
                  Auto VIP Weeks
                  <Tooltip title="Automatically spend VIP Weeks when available">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </span>
              }
            />
            <FormControlLabel
              control={<Checkbox checked={autoWedge} onChange={e => setAutoWedge(e.target.checked)} />}
              label={
                <span>
                  Auto Wedge Hours
                  <Tooltip title="Automatically spend Wedge Hours when available">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </span>
              }
            />
            <FormControlLabel
              control={<Checkbox checked={autoMillionairesVault} onChange={e => setAutoMillionairesVault(e.target.checked)} />}
              label={
                <span>
                  Auto Millionaire's Vault
                  <Tooltip title="Automatically donate to Millionaire's Vault when available">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </span>
              }
            />
          </Stack>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <Button variant="contained" onClick={triggerUpload}>Manual Upload Credit</Button>
            <Button variant="contained" onClick={triggerVIP}>Manual VIP Weeks</Button>
            <Button variant="contained" onClick={triggerWedge}>Manual Wedge Hours</Button>
            <Button variant="contained" onClick={triggerMillionairesVault}>Manual Millionaire's Vault</Button>
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
}