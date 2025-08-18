import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Box,
  Button,
  Tooltip,
  IconButton,
  Collapse,
  Stack,
  Divider
} from "@mui/material";
import FeedbackSnackbar from "./FeedbackSnackbar";
import ConfirmDialog from "./ConfirmDialog";
import AutomationSection from "./AutomationSection";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';



import { stringifyMessage } from '../utils/utils';

export default function PerkAutomationCard({
  buffer, setBuffer,
  wedgeHours, setWedgeHours,
  _autoWedge, setAutoWedge,
  _autoVIP, setAutoVIP,
  _autoUpload, setAutoUpload,
  points,
  // autoMillionairesVault removed
  sessionLabel,
  onActionComplete = () => {}, // <-- new prop
}) {
  // Local state for automation toggles, initialized from props if provided
  const [autoWedge, setAutoWedgeLocal] = useState(_autoWedge ?? false);
  const [autoVIP, setAutoVIPLocal] = useState(_autoVIP ?? false);
  const [autoUpload, setAutoUploadLocal] = useState(_autoUpload ?? false);

  // Ensure prop setters update both local and parent state
  const setAutoWedgeCombined = (val) => {
    setAutoWedgeLocal(val);
    if (typeof setAutoWedge === 'function') setAutoWedge(val);
  };
  const setAutoVIPCombined = (val) => {
    setAutoVIPLocal(val);
    if (typeof setAutoVIP === 'function') setAutoVIP(val);
  };
  const setAutoUploadCombined = (val) => {
    setAutoUploadLocal(val);
    if (typeof setAutoUpload === 'function') setAutoUpload(val);
  };
  // Snackbar state for notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [wedges, setWedges] = useState(null);
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
  const [uploadAmount, setUploadAmount] = useState(1);
  const [vipWeeks, setVipWeeks] = useState(4);
  const [wedgeMethod, setWedgeMethod] = useState("points");
  const [wedgeTriggerType, setWedgeTriggerType] = useState('time');
  const [wedgeTriggerDays, setWedgeTriggerDays] = useState(7);
  const [millionairesVaultAmount, setMillionairesVaultAmount] = useState(2000);
  const [confirmVIPOpen, setConfirmVIPOpen] = useState(false);
  const [confirmUploadOpen, setConfirmUploadOpen] = useState(false);
  const [confirmWedgeOpen, setConfirmWedgeOpen] = useState(false);

  // Wedge automation options state
  const [wedgeTriggerPointThreshold, setWedgeTriggerPointThreshold] = useState(50000);
  const [vipTriggerType, setVipTriggerType] = useState('time');
  const [vipTriggerDays, setVipTriggerDays] = useState(7);
  const [vipTriggerPointThreshold, setVipTriggerPointThreshold] = useState(50000);

  // Load automation settings from session on mount/session change
  useEffect(() => {
    if (!sessionLabel) return;
    fetch(`/api/session/${encodeURIComponent(sessionLabel)}`)
      .then(res => res.json())
      .then(cfg => {
        const pa = cfg.perk_automation || {};
        setBuffer(pa.buffer ?? 0);
        setWedgeHours(pa.wedgeHours ?? 0);
        // --- Upload Credit Automation fields ---
        const upload = (pa.upload_credit || {});
  setAutoUploadCombined(upload.enabled ?? pa.autoUpload ?? false);
        setUploadAmount(upload.gb ?? 1);
        setPointsToKeep(upload.points_to_keep ?? 0);
        setTriggerType(upload.trigger_type ?? 'time');
        setTriggerDays(upload.trigger_days ?? 7);
        setTriggerPointThreshold(upload.trigger_point_threshold ?? 50000);
        // --- Wedge Automation fields ---
        const wedge = (pa.wedge_automation || {});
  setAutoWedgeCombined(wedge.enabled ?? pa.autoWedge ?? false);
        setWedgeTriggerType(wedge.trigger_type ?? 'time');
        setWedgeTriggerDays(wedge.trigger_days ?? 7);
        setWedgeTriggerPointThreshold(wedge.trigger_point_threshold ?? 50000);
        // --- VIP Automation fields ---
        const vip = (pa.vip_automation || {});
  setAutoVIPCombined(vip.enabled ?? pa.autoVIP ?? false);
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
      } else {
        setSnackbar({ open: true, message: stringifyMessage(data.error || `Upload credit purchase failed`), severity: 'error' });
      }
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
          Perk Purchase & Automation
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

          {/* Wedge Section (modularized) */}
          <AutomationSection
            title="Wedge Purchase"
            enabled={autoWedge}
            onToggle={e => setAutoWedgeCombined(e.target.checked)}
            toggleLabel="Enable Wedge Automation"
            toggleDisabled={wedgeDisabled}
            selectLabel="Method"
            selectValue={wedgeMethod}
            selectOptions={[
              { value: "points", label: "Points (50,000)" },
              { value: "cheese", label: "Cheese (5)" }
            ]}
            onSelectChange={e => setWedgeMethod(e.target.value)}
            extraControls={
              <TextField
                label="Frequency (hours)"
                type="number"
                value={wedgeHours}
                onChange={e => setWedgeHours(Number(e.target.value))}
                size="small"
                inputProps={{ min: 0 }}
                sx={{ width: 160, mr: 3, flexShrink: 0 }}
              />
            }
            confirmButton={
              <Tooltip title="This will instantly purchase a wedge using the selected method.">
                <span style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Button variant="contained" sx={{ minWidth: 180 }} onClick={() => setConfirmWedgeOpen(true)}>
                    Purchase Wedge
                  </Button>
                </span>
              </Tooltip>
            }
            tooltip={wedgeDisabled ? wedgeGuardMsg : ''}
            triggerTypeValue={wedgeTriggerType}
            onTriggerTypeChange={e => setWedgeTriggerType(e.target.value)}
            triggerDays={wedgeTriggerDays}
            onTriggerDaysChange={e => setWedgeTriggerDays(Number(e.target.value))}
            triggerPointThreshold={wedgeTriggerPointThreshold}
            onTriggerPointThresholdChange={e => setWedgeTriggerPointThreshold(Number(e.target.value))}
          />
          <Divider sx={{ mb: 3 }} />

          {/* VIP Section (modularized) */}
          <AutomationSection
            title={<span>VIP Purchase
              <Tooltip title="You must be rank Power User or VIP with Power User requirements met in order to purchase VIP">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </span>}
            enabled={autoVIP}
            onToggle={e => setAutoVIPCombined(e.target.checked)}
            toggleLabel="Enable VIP Automation"
            toggleDisabled={vipDisabled}
            selectLabel="Weeks"
            selectValue={vipWeeks}
            selectOptions={[
              { value: 4, label: "4 Weeks" },
              { value: 8, label: "8 Weeks" },
              { value: 90, label: "Fill me up!" }
            ]}
            onSelectChange={e => setVipWeeks(e.target.value)}
            extraControls={
              <Tooltip title={<span>
                4 +weeks = 5,000 points<br/>
                8 weeks = 10,000 points<br/>
                Fill me up! = Top up to 90 days (variable points)
              </span>}>
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
            confirmButton={
              <Tooltip title="This will instantly purchase VIP for the selected duration.">
                <span style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Button variant="contained" sx={{ minWidth: 180 }} onClick={() => setConfirmVIPOpen(true)}>
                    Purchase VIP
                  </Button>
                </span>
              </Tooltip>
            }
            tooltip={vipDisabled ? vipGuardMsg : ''}
            triggerTypeValue={vipTriggerType}
            onTriggerTypeChange={e => setVipTriggerType(e.target.value)}
            triggerDays={vipTriggerDays}
            onTriggerDaysChange={e => setVipTriggerDays(Number(e.target.value))}
            triggerPointThreshold={vipTriggerPointThreshold}
            onTriggerPointThresholdChange={e => setVipTriggerPointThreshold(Number(e.target.value))}
          />
          <Divider sx={{ mb: 3 }} />

          {/* Upload Credit Purchase Section (modularized) */}
          <AutomationSection
            title="Upload Credit Purchase"
            enabled={autoUpload}
            onToggle={e => setAutoUploadCombined(e.target.checked)}
            toggleLabel="Enable Upload Credit Automation"
            toggleDisabled={uploadDisabled}
            selectLabel="Amount"
            selectValue={uploadAmount}
            selectOptions={[
              { value: 1, label: "1GB" },
              { value: 2.5, label: "2.5GB" },
              { value: 5, label: "5GB" },
              { value: 20, label: "20GB" },
              { value: 50, label: "50GB" },
              { value: 100, label: "100GB" }
            ]}
            onSelectChange={e => setUploadAmount(e.target.value)}
            confirmButton={
              <Tooltip title="This will instantly purchase upload credit for the selected amount.">
                <span style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Button variant="contained" sx={{ minWidth: 180 }} onClick={() => setConfirmUploadOpen(true)}>
                    Purchase Upload
                  </Button>
                </span>
              </Tooltip>
            }
            tooltip={uploadDisabled ? uploadGuardMsg : ''}
            triggerTypeValue={triggerType}
            onTriggerTypeChange={e => setTriggerType(e.target.value)}
            triggerDays={triggerDays}
            onTriggerDaysChange={e => setTriggerDays(Number(e.target.value))}
            triggerPointThreshold={triggerPointThreshold}
            onTriggerPointThresholdChange={e => setTriggerPointThreshold(Number(e.target.value))}
          />

          {/* Confirmation Dialogs (modularized) */}
          <ConfirmDialog
            open={confirmWedgeOpen}
            onClose={() => setConfirmWedgeOpen(false)}
            onConfirm={() => triggerManualWedge(wedgeMethod)}
            title="Confirm Wedge Purchase"
            message={`Are you sure you want to instantly purchase a wedge using ${wedgeMethod === 'points' ? 'Points (50,000)' : 'Cheese (5)'}?`}
          />
          <ConfirmDialog
            open={confirmVIPOpen}
            onClose={() => setConfirmVIPOpen(false)}
            onConfirm={triggerVIPManual}
            title="Confirm VIP Purchase"
            message={`Are you sure you want to instantly purchase VIP for ${vipWeeks === 90 ? 'up to 90 days (Fill me up!)' : `${vipWeeks} weeks`}?`}
          />
          <ConfirmDialog
            open={confirmUploadOpen}
            onClose={() => setConfirmUploadOpen(false)}
            onConfirm={triggerUploadManual}
            title="Confirm Upload Credit Purchase"
            message={`Are you sure you want to instantly purchase ${uploadAmount}GB of upload credit?`}
          />

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

          <FeedbackSnackbar
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          />
        </CardContent>
      </Collapse>
    </Card>
  );
}