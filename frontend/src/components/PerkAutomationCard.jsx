import React, { useState, useEffect } from "react";
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

// Utility to robustly stringify any message for snackbars
function stringifyMessage(msg) {
  if (typeof msg === 'string') return msg;
  if (msg instanceof Error) return msg.message;
  if (msg === undefined || msg === null) return '';
  try {
    return JSON.stringify(msg);
  } catch {
    return String(msg);
  }
}

export default function PerkAutomationCard({
  buffer, setBuffer,
  wedgeHours, setWedgeHours,
  autoWedge, setAutoWedge,
  autoVIP, setAutoVIP,
  autoUpload, setAutoUpload,
  points,
  cheese,
  // autoMillionairesVault removed
  sessionLabel,
  onActionComplete = () => {}, // <-- new prop
}) {
  // Guardrail state (must be inside the function body)
  const [guardrails, setGuardrails] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [uploadDisabled, setUploadDisabled] = useState(false);
  const [wedgeDisabled, setWedgeDisabled] = useState(false);
  const [vipDisabled, setVIPDisabled] = useState(false);
  const [uploadGuardMsg, setUploadGuardMsg] = useState("");
  const [wedgeGuardMsg, setWedgeGuardMsg] = useState("");
  const [vipGuardMsg, setVIPGuardMsg] = useState("");
  const [pointsToKeep, setPointsToKeep] = useState(0);
  // Upload automation options state
  const [triggerType, setTriggerType] = useState('time');
  const [triggerDays, setTriggerDays] = useState(7);
  const [triggerPointThreshold, setTriggerPointThreshold] = useState(50000);
  const [expanded, setExpanded] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [uploadAmount, setUploadAmount] = useState(1);
  const [vipWeeks, setVipWeeks] = useState(4);
  const [wedgeMethod, setWedgeMethod] = useState("points");
  const [millionairesVaultAmount, setMillionairesVaultAmount] = useState(2000);
  const [confirmWedgeOpen, setConfirmWedgeOpen] = useState(false);
  const [confirmVIPOpen, setConfirmVIPOpen] = useState(false);
  const [confirmUploadOpen, setConfirmUploadOpen] = useState(false);

  // Wedge automation options state
  const [wedgeTriggerType, setWedgeTriggerType] = useState('time');
  const [wedgeTriggerDays, setWedgeTriggerDays] = useState(7);
  const [wedgeTriggerPointThreshold, setWedgeTriggerPointThreshold] = useState(50000);
  // VIP automation options state
  const [vipTriggerType, setVipTriggerType] = useState('time');
  const [vipTriggerDays, setVipTriggerDays] = useState(7);
  const [vipTriggerPointThreshold, setVipTriggerPointThreshold] = useState(50000);

  // Load automation settings from session on mount/session change
  useEffect(() => {
    if (!sessionLabel) return;
    // Fetch session config
    fetch(`/api/session/${encodeURIComponent(sessionLabel)}`)
      .then(res => res.json())
      .then(cfg => {
        const pa = cfg.perk_automation || {};
        setAutoWedge(pa.autoWedge ?? false);
        setAutoVIP(pa.autoVIP ?? false);
        setAutoUpload(pa.autoUpload ?? false);
        setBuffer(pa.buffer ?? 0);
        setWedgeHours(pa.wedgeHours ?? 0);
        // --- Upload Credit Automation fields ---
        const upload = (pa.upload_credit || {});
        setAutoUpload(upload.enabled ?? pa.autoUpload ?? false);
        setUploadAmount(upload.gb ?? 1);
        setPointsToKeep(upload.points_to_keep ?? 0);
        setTriggerType(upload.trigger_type ?? 'time');
        setTriggerDays(upload.trigger_days ?? 7);
        setTriggerPointThreshold(upload.trigger_point_threshold ?? 50000);
        // --- Wedge Automation fields ---
        const wedge = (pa.wedge_automation || {});
        setWedgeTriggerType(wedge.trigger_type ?? 'time');
        setWedgeTriggerDays(wedge.trigger_days ?? 7);
        setWedgeTriggerPointThreshold(wedge.trigger_point_threshold ?? 50000);
        // --- VIP Automation fields ---
        const vip = (pa.vip_automation || {});
        setVipTriggerType(vip.trigger_type ?? 'time');
        setVipTriggerDays(vip.trigger_days ?? 7);
        setVipTriggerPointThreshold(vip.trigger_point_threshold ?? 50000);
        // Save username for guardrails
        let username = null;
        if (cfg.last_status && cfg.last_status.raw && cfg.last_status.raw.username) {
          username = cfg.last_status.raw.username;
        }
        setCurrentUsername(username);
      });
    // Fetch guardrails info
    fetch('/api/automation/guardrails')
      .then(res => res.json())
      .then(data => setGuardrails(data));
  }, [sessionLabel]);

  // Guardrail logic: check if another session with same username has automation enabled
  useEffect(() => {
    if (!guardrails || !currentUsername || !sessionLabel) return;
    let upload = false, wedge = false, vip = false;
    let uploadMsg = '', wedgeMsg = '', vipMsg = '';
    for (const [label, info] of Object.entries(guardrails)) {
      if (label === sessionLabel) continue;
      if (info.username && info.username === currentUsername) {
        if (info.autoUpload) {
          upload = true;
          uploadMsg = `Upload automation is enabled in session '${label}' for this username.`;
        }
        if (info.autoWedge) {
          wedge = true;
          wedgeMsg = `Wedge automation is enabled in session '${label}' for this username.`;
        }
        if (info.autoVIP) {
          vip = true;
          vipMsg = `VIP automation is enabled in session '${label}' for this username.`;
        }
      }
    }
    setUploadDisabled(upload);
    setWedgeDisabled(wedge);
    setVIPDisabled(vip);
    setUploadGuardMsg(uploadMsg);
    setWedgeGuardMsg(wedgeMsg);
    setVIPGuardMsg(vipMsg);
  }, [guardrails, currentUsername, sessionLabel]);

  // API call helpers
  const triggerWedge = async () => {
    try {
      const res = await fetch("/api/automation/wedge", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: "Wedge automation triggered!", severity: 'success' });
        onActionComplete();
      } else setSnackbar({ open: true, message: stringifyMessage(data.error || "Wedge automation failed"), severity: 'error' });
    } catch (e) {
      setSnackbar({ open: true, message: "Wedge automation failed", severity: 'error' });
    }
  };
  const triggerVIP = async () => {
    try {
      const res = await fetch("/api/automation/vip", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: "VIP automation triggered!", severity: 'success' });
        onActionComplete();
      } else setSnackbar({ open: true, message: stringifyMessage(data.error || "VIP automation failed"), severity: 'error' });
    } catch (e) {
      setSnackbar({ open: true, message: "VIP automation failed", severity: 'error' });
    }
  };
  // Use new endpoint for upload automation
  const triggerUpload = async () => {
    try {
      const res = await fetch("/api/automation/upload_auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: sessionLabel, amount: 1 }) // Always include label
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: "Upload automation triggered!", severity: 'success' });
        onActionComplete();
      } else setSnackbar({ open: true, message: stringifyMessage(data.error || "Upload automation failed"), severity: 'error' });
    } catch (e) {
      setSnackbar({ open: true, message: "Upload automation failed", severity: 'error' });
    }
  };
  // Manual wedge purchase handler
  const triggerManualWedge = async (method) => {
    try {
      const res = await fetch("/api/automation/wedge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: sessionLabel, method }) // Always include label
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: `Wedge purchased with ${method}!`, severity: 'success' });
        onActionComplete();
      } else setSnackbar({ open: true, message: stringifyMessage(data.error || `Wedge purchase with ${method} failed`), severity: 'error' });
    } catch (e) {
      setSnackbar({ open: true, message: `Wedge purchase with ${method} failed`, severity: 'error' });
    }
  };
  const triggerVIPManual = async () => {
    try {
      const res = await fetch("/api/automation/vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: sessionLabel, weeks: vipWeeks }) // Always include label
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: `VIP purchased for ${vipWeeks === 90 ? 'up to 90 days (Fill me up!)' : `${vipWeeks} weeks`}!`, severity: 'success' });
        onActionComplete();
      } else setSnackbar({ open: true, message: stringifyMessage(data.error || `VIP purchase for ${vipWeeks === 90 ? 'up to 90 days (Fill me up!)' : `${vipWeeks} weeks`} failed`), severity: 'error' });
    } catch (e) {
      setSnackbar({ open: true, message: `VIP purchase for ${vipWeeks === 90 ? 'up to 90 days (Fill me up!)' : `${vipWeeks} weeks`} failed`, severity: 'error' });
    }
  };
  const triggerUploadManual = async () => {
    try {
      const res = await fetch("/api/automation/upload_auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: sessionLabel, amount: uploadAmount }) // Always include label
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: `Upload credit purchased: ${uploadAmount}GB!`, severity: 'success' });
        onActionComplete();
      } else setSnackbar({ open: true, message: stringifyMessage(data.error || `Upload credit purchase failed`), severity: 'error' });
    } catch (e) {
      setSnackbar({ open: true, message: `Upload credit purchase failed`, severity: 'error' });
    }
  };
  // Save handler
  const handleSave = async () => {
    if (!sessionLabel) {
      setSnackbar({ open: true, message: "Session label missing!", severity: "error" });
      return;
    }
    const perk_automation = {
      autoWedge,
      autoVIP,
      autoUpload,
      buffer,
      wedgeHours,
      // Upload Credit Automation fields
      upload_credit: {
        enabled: autoUpload,
        gb: Number(uploadAmount),
        min_points: Number(buffer),
        points_to_keep: Number(pointsToKeep),
        trigger_type: triggerType,
        trigger_days: Number(triggerDays),
        trigger_point_threshold: Number(triggerPointThreshold),
      },
      wedge_automation: {
        enabled: autoWedge,
        trigger_type: wedgeTriggerType,
        trigger_days: Number(wedgeTriggerDays),
        trigger_point_threshold: Number(wedgeTriggerPointThreshold),
      },
      vip_automation: {
        enabled: autoVIP,
        trigger_type: vipTriggerType,
        trigger_days: Number(vipTriggerDays),
        trigger_point_threshold: Number(vipTriggerPointThreshold),
      },
    };
    const res = await fetch("/api/session/perkautomation/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: sessionLabel, perk_automation })
    });
    const data = await res.json();
    if (data.success) {
      setSnackbar({ open: true, message: "Automation settings saved!", severity: "success" });
      onActionComplete();
    } else setSnackbar({ open: true, message: stringifyMessage(data.error || "Save failed"), severity: "error" });
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
                  helperText="Must have at least this many points to automate."
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Points to Keep"
                  type="number"
                  value={pointsToKeep}
                  onChange={e => setPointsToKeep(Number(e.target.value))}
                  size="small"
                  fullWidth
                  helperText="Never spend below this many points."
                />
              </Grid>
            </Grid>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* Wedge Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Wedge Purchase</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Tooltip title={wedgeDisabled ? wedgeGuardMsg : ''} disableHoverListener={!wedgeDisabled} arrow>
                <span>
                  <FormControlLabel
                    control={<Checkbox checked={autoWedge} onChange={e => setAutoWedge(e.target.checked)} disabled={wedgeDisabled} />}
                    label={<span>Enable Wedge Automation</span>}
                    sx={{ minWidth: 220, mr: 3, whiteSpace: 'nowrap', flexShrink: 0 }}
                  />
                </span>
              </Tooltip>
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
            {/* Wedge automation options row */}
            <Grid container spacing={2} alignItems="center" sx={{ mt: 1, mb: 2 }}>
              <Grid item>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Trigger Type</InputLabel>
                  <Select
                    value={wedgeTriggerType}
                    label="Trigger Type"
                    onChange={e => setWedgeTriggerType(e.target.value)}
                  >
                    <MenuItem value="time">Time-based</MenuItem>
                    <MenuItem value="points">Point-based</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {(wedgeTriggerType === 'time' || wedgeTriggerType === 'both') && (
                <Grid item>
                  <TextField
                    label="Every X Days"
                    type="number"
                    value={wedgeTriggerDays}
                    onChange={e => setWedgeTriggerDays(Number(e.target.value))}
                    size="small"
                    sx={{ minWidth: 120 }}
                  />
                </Grid>
              )}
              {(wedgeTriggerType === 'points' || wedgeTriggerType === 'both') && (
                <Grid item>
                  <TextField
                    label="Point Threshold"
                    type="number"
                    value={wedgeTriggerPointThreshold}
                    onChange={e => setWedgeTriggerPointThreshold(Number(e.target.value))}
                    size="small"
                    sx={{ minWidth: 140 }}
                  />
                </Grid>
              )}
            </Grid>
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
              <Tooltip title={vipDisabled ? vipGuardMsg : ''} disableHoverListener={!vipDisabled} arrow>
                <span>
                  <FormControlLabel
                    control={<Checkbox checked={autoVIP} onChange={e => setAutoVIP(e.target.checked)} disabled={vipDisabled} />}
                    label={<span>Enable VIP Automation</span>}
                    sx={{ minWidth: 220, mr: 3, whiteSpace: 'nowrap', flexShrink: 0 }}
                  />
                </span>
              </Tooltip>
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
              <Tooltip title={<span>
                4 weeks = 5,000 points<br/>
                8 weeks = 10,000 points<br/>
                Fill me up! = Top up to 90 days (variable points)
              </span>}>
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
            {/* VIP automation options row */}
            <Grid container spacing={2} alignItems="center" sx={{ mt: 1, mb: 2 }}>
              <Grid item>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Trigger Type</InputLabel>
                  <Select
                    value={vipTriggerType}
                    label="Trigger Type"
                    onChange={e => setVipTriggerType(e.target.value)}
                  >
                    <MenuItem value="time">Time-based</MenuItem>
                    <MenuItem value="points">Point-based</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {(vipTriggerType === 'time' || vipTriggerType === 'both') && (
                <Grid item>
                  <TextField
                    label="Every X Days"
                    type="number"
                    value={vipTriggerDays}
                    onChange={e => setVipTriggerDays(Number(e.target.value))}
                    size="small"
                    sx={{ minWidth: 120 }}
                  />
                </Grid>
              )}
              {(vipTriggerType === 'points' || vipTriggerType === 'both') && (
                <Grid item>
                  <TextField
                    label="Point Threshold"
                    type="number"
                    value={vipTriggerPointThreshold}
                    onChange={e => setVipTriggerPointThreshold(Number(e.target.value))}
                    size="small"
                    sx={{ minWidth: 140 }}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* Upload Credit Purchase Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Upload Credit Purchase</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Tooltip title={uploadDisabled ? uploadGuardMsg : ''} disableHoverListener={!uploadDisabled} arrow>
                <span>
                  <FormControlLabel
                    control={<Checkbox checked={autoUpload} onChange={e => setAutoUpload(e.target.checked)} disabled={uploadDisabled} />}
                    label={<span>Enable Upload Credit Automation</span>}
                    sx={{ minWidth: 220, mr: 3, whiteSpace: 'nowrap', flexShrink: 0 }}
                  />
                </span>
              </Tooltip>
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
            {/* Automation Options Row */}
            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Grid item>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Trigger Type</InputLabel>
                  <Select
                    value={triggerType}
                    label="Trigger Type"
                    onChange={e => setTriggerType(e.target.value)}
                  >
                    <MenuItem value="time">Time-based</MenuItem>
                    <MenuItem value="points">Point-based</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {(triggerType === 'time' || triggerType === 'both') && (
                <Grid item>
                  <TextField
                    label="Every X Days"
                    type="number"
                    value={triggerDays}
                    onChange={e => setTriggerDays(Number(e.target.value))}
                    size="small"
                    sx={{ minWidth: 120 }}
                  />
                </Grid>
              )}
              {(triggerType === 'points' || triggerType === 'both') && (
                <Grid item>
                  <TextField
                    label="Point Threshold"
                    type="number"
                    value={triggerPointThreshold}
                    onChange={e => setTriggerPointThreshold(Number(e.target.value))}
                    size="small"
                    sx={{ minWidth: 140 }}
                  />
                </Grid>
              )}
            </Grid>
          </Box>

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

          <Divider sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Tooltip title="Save automation settings for this MAM ID session">
              <span>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Save
                </Button>
              </span>
            </Tooltip>
          </Box>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
              {stringifyMessage(snackbar.message)}
            </Alert>
          </Snackbar>
        </CardContent>
      </Collapse>
    </Card>
  );
}