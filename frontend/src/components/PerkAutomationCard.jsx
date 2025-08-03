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
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider
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
  points,
  cheese,
  autoMillionairesVault = false, setAutoMillionairesVault = () => {}
}) {
  const [expanded, setExpanded] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [uploadAmount, setUploadAmount] = useState(1);
  const [vipWeeks, setVipWeeks] = useState(4);
  const [wedgeMethod, setWedgeMethod] = useState("points");
  const [millionairesVaultAmount, setMillionairesVaultAmount] = useState(2000);
  const [confirmWedgeOpen, setConfirmWedgeOpen] = useState(false);
  const [confirmVIPOpen, setConfirmVIPOpen] = useState(false);
  const [confirmUploadOpen, setConfirmUploadOpen] = useState(false);

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

  // Manual wedge purchase handler
  const triggerManualWedge = async (method) => {
    try {
      const res = await fetch("/api/automation/wedge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method })
      });
      const data = await res.json();
      if (data.success) setSnackbar({ open: true, message: `Wedge purchased with ${method}!`, severity: 'success' });
      else setSnackbar({ open: true, message: data.error || `Wedge purchase with ${method} failed`, severity: 'error' });
    } catch (e) {
      setSnackbar({ open: true, message: `Wedge purchase with ${method} failed`, severity: 'error' });
    }
  };
  const triggerVIPManual = async () => {
    try {
      const res = await fetch("/api/automation/vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeks: vipWeeks })
      });
      const data = await res.json();
      if (data.success) setSnackbar({ open: true, message: `VIP purchased for ${vipWeeks === 90 ? 'up to 90 days (Fill me up!)' : `${vipWeeks} weeks`}!`, severity: 'success' });
      else setSnackbar({ open: true, message: data.error || `VIP purchase for ${vipWeeks === 90 ? 'up to 90 days (Fill me up!)' : `${vipWeeks} weeks`} failed`, severity: 'error' });
    } catch (e) {
      setSnackbar({ open: true, message: `VIP purchase for ${vipWeeks === 90 ? 'up to 90 days (Fill me up!)' : `${vipWeeks} weeks`} failed`, severity: 'error' });
    }
  };
  const triggerUploadManual = async () => {
    try {
      const res = await fetch("/api/automation/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gb: uploadAmount })
      });
      const data = await res.json();
      if (data.success) setSnackbar({ open: true, message: `Upload credit purchased: ${uploadAmount}GB!`, severity: 'success' });
      else setSnackbar({ open: true, message: data.error || `Upload credit purchase failed`, severity: 'error' });
    } catch (e) {
      setSnackbar({ open: true, message: `Upload credit purchase failed`, severity: 'error' });
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', px: 2, pt: 2, pb: 1.5, minHeight: 56 }} onClick={() => setExpanded(e => !e)}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Perk Options
        </Typography>
        <Typography variant="body1" sx={{ mr: 2, color: 'text.secondary' }}>
          Cheese: <b>{cheese !== null && cheese !== undefined ? cheese : "N/A"}</b>
        </Typography>
        <Typography variant="body1" sx={{ mr: 2, color: 'text.secondary' }}>
          Points: <b>{points !== null ? points : "N/A"}</b>
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          {/* Buffer Section */}
          <Box sx={{ mb: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Minimum Points"
                  type="number"
                  value={buffer}
                  onChange={e => setBuffer(Number(e.target.value))}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* Wedge Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Wedge Purchase</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <FormControlLabel
                control={<Checkbox checked={autoWedge} onChange={e => setAutoWedge(e.target.checked)} />}
                label={<span>Enable Wedge Automation</span>}
                sx={{ minWidth: 220, mr: 3, whiteSpace: 'nowrap', flexShrink: 0 }}
              />
              <FormControl size="small" sx={{ minWidth: 140, mr: 3, flexShrink: 0 }}>
                <InputLabel>Method</InputLabel>
                <Select
                  value={wedgeMethod}
                  label="Method"
                  onChange={e => setWedgeMethod(e.target.value)}
                >
                  <MenuItem value="points">Points (50,000)</MenuItem>
                  <MenuItem value="cheese">Cheese (5)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Frequency (hours)"
                type="number"
                value={wedgeHours}
                onChange={e => setWedgeHours(Number(e.target.value))}
                size="small"
                inputProps={{ min: 0 }}
                sx={{ width: 160, mr: 3, flexShrink: 0 }}
              />
              <Box sx={{ flexGrow: 1 }} />
              <Tooltip title="This will instantly purchase a wedge using the selected method.">
                <span style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Button variant="contained" sx={{ minWidth: 180 }} onClick={() => setConfirmWedgeOpen(true)}>
                    Purchase Wedge
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* VIP Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>VIP Purchase
              <Tooltip title="You must be rank Power User or VIP with Power User requirements met in order to purchase VIP">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <FormControlLabel
                control={<Checkbox checked={autoVIP} onChange={e => setAutoVIP(e.target.checked)} />}
                label={<span>Enable VIP Automation</span>}
                sx={{ minWidth: 220, mr: 3, whiteSpace: 'nowrap', flexShrink: 0 }}
              />
              <FormControl size="small" sx={{ minWidth: 120, mr: 1, flexShrink: 0 }}>
                <InputLabel>Weeks</InputLabel>
                <Select
                  value={vipWeeks}
                  label="Weeks"
                  onChange={e => setVipWeeks(e.target.value)}
                >
                  <MenuItem value={4}>4 Weeks</MenuItem>
                  <MenuItem value={8}>8 Weeks</MenuItem>
                  <MenuItem value={90}>Fill me up!</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title="Fill me up! = Top up to 90 days">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Box sx={{ flexGrow: 1 }} />
              <Tooltip title="This will instantly purchase VIP for the selected duration.">
                <span style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Button variant="contained" sx={{ minWidth: 180 }} onClick={() => setConfirmVIPOpen(true)}>
                    Purchase VIP
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* Upload Credit Purchase Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Upload Credit Purchase</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <FormControlLabel
                control={<Checkbox checked={autoUpload} onChange={e => setAutoUpload(e.target.checked)} />}
                label={<span>Enable Upload Credit Automation</span>}
                sx={{ minWidth: 220, mr: 3, whiteSpace: 'nowrap', flexShrink: 0 }}
              />
              <FormControl size="small" sx={{ minWidth: 110, mr: 3, flexShrink: 0 }}>
                <InputLabel>Amount</InputLabel>
                <Select
                  value={uploadAmount}
                  label="Amount"
                  onChange={e => setUploadAmount(e.target.value)}
                >
                  <MenuItem value={1}>1GB</MenuItem>
                  <MenuItem value={2.5}>2.5GB</MenuItem>
                  <MenuItem value={5}>5GB</MenuItem>
                  <MenuItem value={20}>20GB</MenuItem>
                  <MenuItem value={50}>50GB</MenuItem>
                  <MenuItem value={100}>100GB</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ flexGrow: 1 }} />
              <Tooltip title="This will instantly purchase upload credit for the selected amount.">
                <span style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Button variant="contained" sx={{ minWidth: 180 }} onClick={() => setConfirmUploadOpen(true)}>
                    Purchase Upload
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* Millionaire's Vault Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Millionaire's Vault</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <FormControlLabel
                control={<Checkbox checked={autoMillionairesVault} onChange={e => setAutoMillionairesVault(e.target.checked)} />}
                label={<span>Enable Millionaire's Vault Automation</span>}
                sx={{ minWidth: 220, mr: 3, whiteSpace: 'nowrap', flexShrink: 0 }}
              />
              <FormControl size="small" sx={{ minWidth: 140, mr: 3, flexShrink: 0 }}>
                <InputLabel>Points</InputLabel>
                <Select
                  value={millionairesVaultAmount}
                  label="Points"
                  onChange={e => setMillionairesVaultAmount(e.target.value)}
                >
                  {[...Array(20)].map((_, i) => {
                    const val = (i + 1) * 100;
                    return <MenuItem key={val} value={val}>{val.toLocaleString()} points</MenuItem>;
                  })}
                </Select>
              </FormControl>
              <Box sx={{ flexGrow: 1 }} />
              <Tooltip title="This will instantly donate the selected amount to Millionaire's Vault.">
                <span style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Button variant="contained" sx={{ minWidth: 180 }} onClick={triggerMillionairesVault}>
                    Donate
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Box>
          <Divider sx={{ mb: 1 }} />

          {/* Confirmation Dialogs */}
          <Dialog open={confirmWedgeOpen} onClose={() => setConfirmWedgeOpen(false)}>
            <DialogTitle>Confirm Wedge Purchase</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to instantly purchase a wedge using {wedgeMethod === 'points' ? 'Points (50,000)' : 'Cheese (5)'}?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmWedgeOpen(false)}>Cancel</Button>
              <Button onClick={() => { setConfirmWedgeOpen(false); triggerManualWedge(wedgeMethod); }} color="primary" variant="contained">Confirm</Button>
            </DialogActions>
          </Dialog>
          <Dialog open={confirmVIPOpen} onClose={() => setConfirmVIPOpen(false)}>
            <DialogTitle>Confirm VIP Purchase</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to instantly purchase VIP for {vipWeeks === 90 ? 'up to 90 days (Fill me up!)' : `${vipWeeks} weeks`}?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmVIPOpen(false)}>Cancel</Button>
              <Button onClick={() => { setConfirmVIPOpen(false); triggerVIPManual(); }} color="primary" variant="contained">Confirm</Button>
            </DialogActions>
          </Dialog>
          <Dialog open={confirmUploadOpen} onClose={() => setConfirmUploadOpen(false)}>
            <DialogTitle>Confirm Upload Credit Purchase</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to instantly purchase {uploadAmount}GB of upload credit?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmUploadOpen(false)}>Cancel</Button>
              <Button onClick={() => { setConfirmUploadOpen(false); triggerUploadManual(); }} color="primary" variant="contained">Confirm</Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </CardContent>
      </Collapse>
    </Card>
  );
}