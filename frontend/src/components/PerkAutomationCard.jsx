import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from '../context/SessionContext.jsx';
import { stringifyMessage } from '../utils/utils';
import AutomationSection from './AutomationSection';
import ConfirmDialog from './ConfirmDialog';
import FeedbackSnackbar from './FeedbackSnackbar';

export default function PerkAutomationCard({
  _autoWedge,
  setAutoWedge,
  _autoVIP,
  setAutoVIP,
  _autoUpload,
  setAutoUpload,
  onActionComplete = () => {},
}) {
  const { sessionLabel, points, setPoints } = useSession();
  // Local state for automation toggles, initialized from props if provided
  const [autoWedge, setAutoWedgeLocal] = useState(_autoWedge ?? false);
  const [autoVIP, setAutoVIPLocal] = useState(_autoVIP ?? false);
  const [autoUpload, setAutoUploadLocal] = useState(_autoUpload ?? false);
  const [minPoints, setMinPoints] = useState(0);

  // Ensure prop setters update both local and parent state. Memoize so
  // they can safely be used in effect dependency arrays without
  // triggering Biome/react-hooks warnings.
  const setAutoWedgeCombined = useCallback(
    (val) => {
      setAutoWedgeLocal(val);
      if (typeof setAutoWedge === 'function') setAutoWedge(val);
    },
    [setAutoWedge],
  );

  const setAutoVIPCombined = useCallback(
    (val) => {
      setAutoVIPLocal(val);
      if (typeof setAutoVIP === 'function') setAutoVIP(val);
    },
    [setAutoVIP],
  );

  const setAutoUploadCombined = useCallback(
    (val) => {
      setAutoUploadLocal(val);
      if (typeof setAutoUpload === 'function') setAutoUpload(val);
    },
    [setAutoUpload],
  );
  // Snackbar state for notifications
  const [snackbar, setSnackbar] = useState({
    message: '',
    open: false,
    severity: 'info',
  });
  const [_wedges, _setWedges] = useState(null);
  // Guardrail state (must be inside the function body)
  const [guardrails, setGuardrails] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [uploadDisabled, setUploadDisabled] = useState(false);
  const [wedgeDisabled, setWedgeDisabled] = useState(false);
  const [vipDisabled, setVIPDisabled] = useState(false);
  const [uploadGuardMsg, setUploadGuardMsg] = useState('');
  const [wedgeGuardMsg, setWedgeGuardMsg] = useState('');
  const [vipGuardMsg, setVIPGuardMsg] = useState('');
  // Upload automation options state
  const [triggerType, setTriggerType] = useState('time');
  const [triggerDays, setTriggerDays] = useState(7);
  const [triggerPointThreshold, setTriggerPointThreshold] = useState(50000);
  const [expanded, setExpanded] = useState(false);
  const [uploadAmount, setUploadAmount] = useState(1);
  const [vipWeeks, setVipWeeks] = useState(4);
  const [wedgeMethod, setWedgeMethod] = useState('points');
  const [wedgeTriggerType, setWedgeTriggerType] = useState('time');
  const [wedgeTriggerDays, setWedgeTriggerDays] = useState(7);
  const [_millionairesVaultAmount, _setMillionairesVaultAmount] = useState(2000);
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
      .then((res) => res.json())
      .then((cfg) => {
        const pa = cfg.perk_automation || {};
        setMinPoints(pa.min_points ?? 0);
        // --- Upload Credit Automation fields ---
        const upload = pa.upload_credit || {};
        setAutoUploadCombined(upload.enabled ?? pa.autoUpload ?? false);
        setUploadAmount(upload.gb ?? 1);
        setPoints?.(cfg.points ?? null);
        setTriggerType(upload.trigger_type ?? 'time');
        setTriggerDays(upload.trigger_days ?? 7);
        setTriggerPointThreshold(upload.trigger_point_threshold ?? 50000);
        // --- Wedge Automation fields ---
        const wedge = pa.wedge_automation || {};
        setAutoWedgeCombined(wedge.enabled ?? pa.autoWedge ?? false);
        setWedgeTriggerType(wedge.trigger_type ?? 'time');
        setWedgeTriggerDays(wedge.trigger_days ?? 7);
        setWedgeTriggerPointThreshold(wedge.trigger_point_threshold ?? 50000);
        // --- VIP Automation fields ---
        const vip = pa.vip_automation || {};
        setAutoVIPCombined(vip.enabled ?? pa.autoVIP ?? false);
        setVipTriggerType(vip.trigger_type ?? 'time');
        setVipTriggerDays(vip.trigger_days ?? 7);
        setVipTriggerPointThreshold(vip.trigger_point_threshold ?? 50000);
        setVipWeeks(vip.weeks ?? 4);
        // Save username for guardrails
        let username = null;
        if (cfg.last_status?.raw?.username) {
          username = cfg.last_status.raw.username;
        }
        setCurrentUsername(username);
      });
    fetch('/api/automation/guardrails')
      .then((res) => res.json())
      .then((data) => setGuardrails(data));
  }, [sessionLabel, setAutoUploadCombined, setAutoVIPCombined, setAutoWedgeCombined, setPoints]);

  // Guardrail logic: check if another session with same username has automation enabled
  useEffect(() => {
    if (!guardrails || !currentUsername || !sessionLabel) return;
    let upload = false,
      wedge = false,
      vip = false;
    let uploadMsg = '',
      wedgeMsg = '',
      vipMsg = '';
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
  const _triggerWedge = async () => {
    try {
      const res = await fetch('/api/automation/wedge', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSnackbar({
          message: 'Wedge automation triggered!',
          open: true,
          severity: 'success',
        });
        onActionComplete();
      } else
        setSnackbar({
          message: stringifyMessage(data.error || 'Wedge automation failed'),
          open: true,
          severity: 'error',
        });
    } catch (_e) {
      setSnackbar({
        message: 'Wedge automation failed',
        open: true,
        severity: 'error',
      });
    }
  };
  const _triggerVIP = async () => {
    try {
      const res = await fetch('/api/automation/vip', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSnackbar({
          message: 'VIP automation triggered!',
          open: true,
          severity: 'success',
        });
        onActionComplete();
      } else
        setSnackbar({
          message: stringifyMessage(data.error || 'VIP automation failed'),
          open: true,
          severity: 'error',
        });
    } catch (_e) {
      setSnackbar({
        message: 'VIP automation failed',
        open: true,
        severity: 'error',
      });
    }
  };
  // Use new endpoint for upload automation
  const _triggerUpload = async () => {
    try {
      const res = await fetch('/api/automation/upload_auto', {
        body: JSON.stringify({ amount: 1, label: sessionLabel }), // Always include label
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({
          message: 'Upload automation triggered!',
          open: true,
          severity: 'success',
        });
        onActionComplete();
      } else
        setSnackbar({
          message: stringifyMessage(data.error || 'Upload automation failed'),
          open: true,
          severity: 'error',
        });
    } catch (_e) {
      setSnackbar({
        message: 'Upload automation failed',
        open: true,
        severity: 'error',
      });
    }
  };
  // Manual wedge purchase handler
  const triggerManualWedge = async (method) => {
    try {
      const res = await fetch('/api/automation/wedge', {
        body: JSON.stringify({ label: sessionLabel, method }), // Always include label
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({
          message: `Wedge purchased with ${method}!`,
          open: true,
          severity: 'success',
        });
        onActionComplete();
      } else
        setSnackbar({
          message: stringifyMessage(data.error || `Wedge purchase with ${method} failed`),
          open: true,
          severity: 'error',
        });
    } catch (_e) {
      setSnackbar({
        message: `Wedge purchase with ${method} failed`,
        open: true,
        severity: 'error',
      });
    }
  };
  const triggerVIPManual = async () => {
    try {
      const res = await fetch('/api/automation/vip', {
        body: JSON.stringify({ label: sessionLabel, weeks: vipWeeks }), // Always include label
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({
          message: `VIP purchased for ${vipWeeks === 90 ? 'up to 90 days (Max me out!)' : `${vipWeeks} weeks`}!`,
          open: true,
          severity: 'success',
        });
        onActionComplete();
      } else
        setSnackbar({
          message: stringifyMessage(
            data.error ||
              `VIP purchase for ${vipWeeks === 90 ? 'up to 90 days (Max me out!)' : `${vipWeeks} weeks`} failed`,
          ),
          open: true,
          severity: 'error',
        });
    } catch (_e) {
      setSnackbar({
        message: `VIP purchase for ${vipWeeks === 90 ? 'up to 90 days (Max me out!)' : `${vipWeeks} weeks`} failed`,
        open: true,
        severity: 'error',
      });
    }
  };
  const triggerUploadManual = async () => {
    try {
      const res = await fetch('/api/automation/upload_auto', {
        body: JSON.stringify({ amount: uploadAmount, label: sessionLabel }), // Always include label
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({
          message: `Upload credit purchased: ${uploadAmount}GB!`,
          open: true,
          severity: 'success',
        });
        onActionComplete();
      } else {
        setSnackbar({
          message: stringifyMessage(data.error || `Upload credit purchase failed`),
          open: true,
          severity: 'error',
        });
      }
    } catch (_e) {
      setSnackbar({
        message: `Upload credit purchase failed`,
        open: true,
        severity: 'error',
      });
    }
  };
  // Save handler
  const handleSave = async () => {
    if (!sessionLabel) {
      setSnackbar({
        message: 'Session label missing!',
        open: true,
        severity: 'error',
      });
      return;
    }
    // Load previous automation config if available (to preserve timestamps)
    let prevWedgeTime = null,
      prevVIPTime = null,
      prevUploadTime = null;
    try {
      const res = await fetch(`/api/session/${encodeURIComponent(sessionLabel)}`);
      if (res.ok) {
        const cfg = await res.json();
        prevWedgeTime = cfg?.perk_automation?.wedge_automation?.last_wedge_time ?? null;
        prevVIPTime = cfg?.perk_automation?.vip_automation?.last_vip_time ?? null;
        prevUploadTime = cfg?.perk_automation?.upload_credit?.last_upload_time ?? null;
      }
    } catch {}

    // Helper for timestamp logic
    function getNewTimestamp(enabled, triggerType, prevTime) {
      if (enabled && triggerType === 'time') {
        if (!prevTime) return Date.now();
        return prevTime;
      } else if (!enabled) {
        return null;
      } else {
        return prevTime;
      }
    }

    const newWedgeTime = getNewTimestamp(autoWedge, wedgeTriggerType, prevWedgeTime);
    const newVIPTime = getNewTimestamp(autoVIP, vipTriggerType, prevVIPTime);
    const newUploadTime = getNewTimestamp(autoUpload, triggerType, prevUploadTime);

    const perk_automation = {
      autoUpload,
      autoVIP,
      autoWedge,
      min_points: Number(minPoints),
      upload_credit: {
        enabled: autoUpload,
        gb: Number(uploadAmount),
        last_upload_time: newUploadTime,
        trigger_days: Number(triggerDays),
        trigger_point_threshold: Number(triggerPointThreshold),
        trigger_type: triggerType,
      },
      vip_automation: {
        enabled: autoVIP,
        last_vip_time: newVIPTime,
        trigger_days: Number(vipTriggerDays),
        trigger_point_threshold: Number(vipTriggerPointThreshold),
        trigger_type: vipTriggerType,
        weeks: vipWeeks,
      },
      wedge_automation: {
        enabled: autoWedge,
        last_wedge_time: newWedgeTime,
        trigger_days: Number(wedgeTriggerDays),
        trigger_point_threshold: Number(wedgeTriggerPointThreshold),
        trigger_type: wedgeTriggerType,
      },
    };
    const res = await fetch('/api/session/perkautomation/save', {
      body: JSON.stringify({ label: sessionLabel, perk_automation }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const data = await res.json();
    if (data.success) {
      setSnackbar({
        message: 'Automation settings saved!',
        open: true,
        severity: 'success',
      });
      onActionComplete();
    } else
      setSnackbar({
        message: stringifyMessage(data.error || 'Save failed'),
        open: true,
        severity: 'error',
      });
  };

  return (
    <Card sx={{ borderRadius: 2, mb: 3 }}>
      <Box
        onClick={() => setExpanded((e) => !e)}
        sx={{
          alignItems: 'center',
          cursor: 'pointer',
          display: 'flex',
          minHeight: 56,
          pb: 1.5,
          pt: 2,
          px: 2,
        }}
      >
        <Typography sx={{ flexGrow: 1 }} variant="h6">
          Perk Purchase & Automation
        </Typography>
        <Typography sx={{ color: 'text.secondary', mr: 2 }} variant="body1">
          Points: <b>{points !== null ? points : 'N/A'}</b>
        </Typography>
        <IconButton size="small">{expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          {/* Padding above first row, only visible when expanded */}
          <Box sx={{ height: 7 }} />
          <Box sx={{ maxWidth: 400, mb: 2 }}>
            <TextField
              helperText="Automation will never run if points are below this value."
              inputProps={{ min: 0, step: 1000 }}
              label="Minimum Points (Session Guardrail)"
              onChange={(e) => setMinPoints(e.target.value)}
              size="small"
              sx={{ maxWidth: 400 }}
              type="number"
              value={minPoints}
            />
          </Box>
          {/* Wedge Section (modularized) */}
          <AutomationSection
            confirmButton={
              <Tooltip title="This will instantly purchase a wedge using the selected method.">
                <span
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    width: '100%',
                  }}
                >
                  <Button
                    onClick={() => setConfirmWedgeOpen(true)}
                    sx={{ minWidth: 180 }}
                    variant="contained"
                  >
                    Purchase Wedge
                  </Button>
                </span>
              </Tooltip>
            }
            enabled={autoWedge}
            onSelectChange={(e) => setWedgeMethod(e.target.value)}
            onToggle={(e) => setAutoWedgeCombined(e.target.checked)}
            onTriggerDaysChange={(e) => setWedgeTriggerDays(Number(e.target.value))}
            onTriggerPointThresholdChange={(e) =>
              setWedgeTriggerPointThreshold(Number(e.target.value))
            }
            onTriggerTypeChange={(e) => setWedgeTriggerType(e.target.value)}
            selectLabel="Method"
            selectOptions={[
              { label: 'Points (50,000)', value: 'points' },
              { label: 'Cheese (5)', value: 'cheese' },
            ]}
            selectValue={wedgeMethod}
            title="Wedge Purchase"
            toggleDisabled={wedgeDisabled}
            toggleLabel="Enable Wedge Automation"
            tooltip={wedgeDisabled ? wedgeGuardMsg : ''}
            triggerDays={wedgeTriggerDays}
            triggerPointThreshold={wedgeTriggerPointThreshold}
            triggerTypeValue={wedgeTriggerType}
          />
          <Divider sx={{ mb: 3 }} />

          {/* VIP Section (modularized) */}
          <AutomationSection
            confirmButton={
              <Tooltip title="This will instantly purchase VIP for the selected duration.">
                <span
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    width: '100%',
                  }}
                >
                  <Button
                    onClick={() => setConfirmVIPOpen(true)}
                    sx={{ minWidth: 180 }}
                    variant="contained"
                  >
                    Purchase VIP
                  </Button>
                </span>
              </Tooltip>
            }
            enabled={autoVIP}
            extraControls={
              <Tooltip
                title={
                  <span>
                    4 +weeks = 5,000 points
                    <br />8 weeks = 10,000 points
                    <br />
                    Max me out! = Top up to 90 days (variable points)
                  </span>
                }
              >
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
            onSelectChange={(e) => setVipWeeks(e.target.value)}
            onToggle={(e) => setAutoVIPCombined(e.target.checked)}
            onTriggerDaysChange={(e) => setVipTriggerDays(Number(e.target.value))}
            onTriggerPointThresholdChange={(e) =>
              setVipTriggerPointThreshold(Number(e.target.value))
            }
            onTriggerTypeChange={(e) => setVipTriggerType(e.target.value)}
            selectLabel="VIP Duration"
            selectOptions={[
              { label: '4 Weeks', value: 4 },
              { label: '8 Weeks', value: 8 },
              { label: 'Max me out!', value: 90 },
            ]}
            selectValue={vipWeeks}
            title={
              <span>
                VIP Purchase
                <Tooltip title="You must be rank Power User or VIP with Power User requirements met in order to purchase VIP">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </span>
            }
            toggleDisabled={vipDisabled}
            toggleLabel="Enable VIP Automation"
            tooltip={vipDisabled ? vipGuardMsg : ''}
            triggerDays={vipTriggerDays}
            triggerPointThreshold={vipTriggerPointThreshold}
            triggerTypeValue={vipTriggerType}
          />
          <Divider sx={{ mb: 3 }} />

          {/* Upload Credit Purchase Section (modularized) */}
          <AutomationSection
            confirmButton={
              <Tooltip title="This will instantly purchase upload credit for the selected amount.">
                <span
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    width: '100%',
                  }}
                >
                  <Button
                    onClick={() => setConfirmUploadOpen(true)}
                    sx={{ minWidth: 180 }}
                    variant="contained"
                  >
                    Purchase Upload
                  </Button>
                </span>
              </Tooltip>
            }
            enabled={autoUpload}
            onSelectChange={(e) => setUploadAmount(e.target.value)}
            onToggle={(e) => setAutoUploadCombined(e.target.checked)}
            onTriggerDaysChange={(e) => setTriggerDays(Number(e.target.value))}
            onTriggerPointThresholdChange={(e) => setTriggerPointThreshold(Number(e.target.value))}
            onTriggerTypeChange={(e) => setTriggerType(e.target.value)}
            selectLabel="Amount"
            selectOptions={[
              { label: '1GB', value: 1 },
              { label: '2.5GB', value: 2.5 },
              { label: '5GB', value: 5 },
              { label: '20GB', value: 20 },
              { label: '100GB', value: 100 },
            ]}
            selectValue={uploadAmount}
            title="Upload Credit Purchase"
            toggleDisabled={uploadDisabled}
            toggleLabel="Enable Upload Credit Automation"
            tooltip={uploadDisabled ? uploadGuardMsg : ''}
            triggerDays={triggerDays}
            triggerPointThreshold={triggerPointThreshold}
            triggerTypeValue={triggerType}
          />

          {/* Confirmation Dialogs (modularized) */}
          <ConfirmDialog
            message={`Are you sure you want to instantly purchase a wedge using ${wedgeMethod === 'points' ? 'Points (50,000)' : 'Cheese (5)'}?`}
            onClose={() => setConfirmWedgeOpen(false)}
            onConfirm={() => triggerManualWedge(wedgeMethod)}
            open={confirmWedgeOpen}
            title="Confirm Wedge Purchase"
          />
          <ConfirmDialog
            message={`Are you sure you want to instantly purchase VIP for ${vipWeeks === 90 ? 'up to 90 days (Max me out!)' : `${vipWeeks} weeks`}?`}
            onClose={() => setConfirmVIPOpen(false)}
            onConfirm={triggerVIPManual}
            open={confirmVIPOpen}
            title="Confirm VIP Purchase"
          />
          <ConfirmDialog
            message={`Are you sure you want to instantly purchase ${uploadAmount}GB of upload credit?`}
            onClose={() => setConfirmUploadOpen(false)}
            onConfirm={triggerUploadManual}
            open={confirmUploadOpen}
            title="Confirm Upload Credit Purchase"
          />

          <Divider sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Tooltip title="Save automation settings for this MAM ID session">
              <span>
                <Button color="primary" onClick={handleSave} variant="contained">
                  Save
                </Button>
              </span>
            </Tooltip>
          </Box>

          <FeedbackSnackbar
            message={snackbar.message}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            open={snackbar.open}
            severity={snackbar.severity}
          />
        </CardContent>
      </Collapse>
    </Card>
  );
}
