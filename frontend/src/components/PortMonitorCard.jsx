import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import { Card, CardContent, Typography, Button, TextField, Box, List, ListItem, ListItemText, IconButton, Alert, Tooltip, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Collapse } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const API_BASE = '/api/port-monitor';
const INTERVAL_OPTIONS = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

export default function PortMonitorCard() {
  // Refresh a single port check status
  const handleRefreshCheck = async (container, port) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/check?container_name=${encodeURIComponent(container)}&port=${port}&force=1`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || data.error || 'Failed to refresh port check.');
      } else {
        setSuccess('Port check refreshed.');
        setTimeout(() => setSuccess(null), 2000);
        fetchChecks();
      }
    } catch (e) {
      setError('Failed to refresh port check.');
    }
    setLoading(false);
  };
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [containers, setContainers] = useState([]);
  const [checks, setChecks] = useState([]);
  const [port, setPort] = useState('');
  const [containerName, setContainerName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dockerPermission, setDockerPermission] = useState(true);
  const [interval, setInterval] = useState(60);
  const [intervalLoading, setIntervalLoading] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [editRestartOnFail, setEditRestartOnFail] = useState(false);
  const [editNotifyOnFail, setEditNotifyOnFail] = useState(false);
  const [editInterval, setEditInterval] = useState(1);
  const handleEditClick = (idx, check) => {
    setEditIdx(idx);
    setEditRestartOnFail(!!check.restart_on_fail);
    setEditNotifyOnFail(!!check.notify_on_fail);
    setEditInterval(check.interval || 1);
  };

  const handleEditSave = async (check) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/checks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          container_name: check.container_name,
          port: check.port,
          restart_on_fail: editRestartOnFail,
          notify_on_fail: editNotifyOnFail,
          interval: editInterval
        })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || data.error || 'Failed to update port check.');
      } else {
        setSuccess('Port check updated.');
        setTimeout(() => setSuccess(null), 2000);
        setEditIdx(null);
        fetchChecks();
      }
    } catch (e) {
      setError('Failed to update port check.');
    }
    setLoading(false);
  };

  const handleEditCancel = () => {
    setEditIdx(null);
  };
  const [restartOnFail, setRestartOnFail] = useState(true);
  const [notifyOnFail, setNotifyOnFail] = useState(false);

  // Fetch containers, checks, and interval on mount
  useEffect(() => {
    fetchContainers();
    fetchChecks();
    fetchInterval();
  }, []);

  const fetchContainers = async () => {
    try {
      const res = await fetch(`${API_BASE}/containers`);
      if (!res.ok) {
        let showPerm = false;
        try {
          const data = await res.json();
          if (data && (data.detail || data.error)) {
            if ((data.detail || data.error).includes('Docker Engine is not accessible') || (data.detail || data.error).includes('Docker Engine permission')) {
              showPerm = true;
            }
          }
        } catch {}
        setDockerPermission(!showPerm);
        setError(showPerm ? null : 'Failed to fetch containers.');
        return;
      }
      const data = await res.json();
      setContainers(data.sort((a, b) => a.localeCompare(b)));
      setDockerPermission(true);
      setError(null);
    } catch (e) {
      setDockerPermission(false);
      setError('Failed to fetch containers.');
    }
  };

  const fetchChecks = async () => {
    try {
      const res = await fetch(`${API_BASE}/checks`);
      if (!res.ok) {
        let showPerm = false;
        try {
          const data = await res.json();
          if (data && (data.detail || data.error)) {
            if ((data.detail || data.error).includes('Docker Engine is not accessible') || (data.detail || data.error).includes('Docker Engine permission')) {
              showPerm = true;
            }
          }
        } catch {}
        setDockerPermission(!showPerm);
        setError(showPerm ? null : 'Failed to fetch port checks.');
        return;
      }
      const data = await res.json();
      setChecks(data);
      setDockerPermission(true);
      setError(null);
    } catch (e) {
      setDockerPermission(false);
      setError('Failed to fetch port checks.');
    }
  };

  const fetchInterval = async () => {
    setIntervalLoading(true);
    try {
      const res = await fetch(`${API_BASE}/interval`);
      if (res.ok) {
        const data = await res.json();
        setInterval(data);
      }
    } catch (e) {}
    setIntervalLoading(false);
  };

  const handleIntervalChange = async (e) => {
    const newInterval = Number(e.target.value);
    setIntervalLoading(true);
    try {
      const res = await fetch(`${API_BASE}/interval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval: newInterval })
      });
      if (res.ok) {
        setInterval(newInterval);
        setSuccess('Port check interval updated.');
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError('Failed to update interval.');
      }
    } catch (e) {
      setError('Failed to update interval.');
    }
    setIntervalLoading(false);
  };

  const handleAddCheck = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/checks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          container_name: containerName,
          port: Number(port),
          interval: Number(interval),
          restart_on_fail: restartOnFail,
          notify_on_fail: notifyOnFail
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || data.error || 'Failed to add port check.');
      } else {
        setSuccess('Port check added.');
        setTimeout(() => setSuccess(null), 2000);
        setPort('');
        setContainerName('');
        setRestartOnFail(true);
        setNotifyOnFail(false);
        fetchChecks();
      }
    } catch (e) {
      setError('Failed to add port check.');
    }
    setLoading(false);
  };

  const handleDeleteCheck = async (container, port) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/checks?container_name=${encodeURIComponent(container)}&port=${port}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || data.error || 'Failed to delete port check.');
      } else {
        setSuccess('Port check deleted.');
        setTimeout(() => setSuccess(null), 2000);
        fetchChecks();
      }
    } catch (e) {
      setError('Failed to delete port check.');
    }
    setLoading(false);
  };

  return (
  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', px: 2, pt: 2, pb: 1.5, minHeight: 56 }} onClick={() => setExpanded(e => !e)}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Port Monitoring
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandMoreIcon sx={{ transform: 'rotate(180deg)' }} /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Monitor forwarded ports for any running container. Add a check below.
          </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <FormControl size="small" sx={{ minWidth: 180, maxWidth: 220 }} disabled={!dockerPermission || loading}>
              <InputLabel id="container-select-label">Container</InputLabel>
              <Select
                labelId="container-select-label"
                value={containerName}
                label="Container"
                onChange={e => setContainerName(e.target.value)}
                disabled={!dockerPermission || loading}
                MenuProps={{ disableScrollLock: true }}
              >
                <MenuItem value="" disabled>{containers.length === 0 ? "No running containers" : "Select container"}</MenuItem>
                {containers.map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Removed tooltip for container selection for consistency */}
            <TextField
              label="Port"
              type="number"
              value={port}
              onChange={e => setPort(e.target.value)}
              size="small"
              sx={{ width: 140 }}
              inputProps={{ maxLength: 5 }}
              disabled={!dockerPermission || loading}
            />
            <FormControl size="small" sx={{ minWidth: 180, maxWidth: 220 }}>
              <InputLabel id="interval-select-label">Check Interval (min)</InputLabel>
              <Select
                labelId="interval-select-label"
                value={interval}
                label="Check Interval (min)"
                onChange={handleIntervalChange}
                disabled={intervalLoading}
                MenuProps={{ disableScrollLock: true }}
              >
                {INTERVAL_OPTIONS.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt} minutes</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 2, flexWrap: 'nowrap', width: '100%' }}>
              <FormControlLabel
                control={<Checkbox checked={restartOnFail} onChange={e => setRestartOnFail(e.target.checked)} disabled={loading} />}
                label={<span style={{ whiteSpace: 'nowrap' }}>Restart on Fail</span>}
                sx={{ ml: 0 }}
              />
              <FormControlLabel
                control={<Checkbox checked={notifyOnFail} onChange={e => setNotifyOnFail(e.target.checked)} disabled={loading} />}
                label={<span style={{ whiteSpace: 'nowrap' }}>Notify on Fail</span>}
                sx={{ ml: 2 }}
              />
              <Box sx={{ flex: '0 0 auto', marginLeft: 'auto' }}>
                <Tooltip title={!dockerPermission ? "Docker Engine permissions required to add a port check." : (!containerName || !port ? "Select a container and port" : "") }>
                  <span>
                    <Button
                      variant="contained"
                      onClick={handleAddCheck}
                      disabled={!dockerPermission || !containerName || !port || loading}
                      sx={{ minWidth: 110 }}
                    >
                      Add Check
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Box>
        {!dockerPermission && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Docker Engine permissions are required to use Port Monitoring.
          </Alert>
        )}
        {error && error !== 'Docker Engine permission error.' && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert>}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>Active Port Checks</Typography>
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {checks.length === 0 && <Typography color="text.secondary">No port checks configured.</Typography>}
            {checks.map((check, idx) => (
              <Box
                key={check.container_name + ':' + check.port}
                sx={theme => ({
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  background: theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5',
                  boxShadow: 0,
                  position: 'relative',
                })}
              >
              <IconButton
                edge="end"
                aria-label="refresh"
                onClick={() => handleRefreshCheck(check.container_name, check.port)}
                disabled={!dockerPermission || loading}
                size="small"
                sx={{ position: 'absolute', top: 8, right: 72 }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleEditClick(idx, check)}
                disabled={!dockerPermission || loading}
                size="small"
                sx={{ position: 'absolute', top: 8, right: 40 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDeleteCheck(check.container_name, check.port)}
                disabled={!dockerPermission || loading}
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Container: {check.container_name}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                IP:Port: {check.ip || '...'}:{check.port}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Interval: {check.interval ? `${check.interval} minutes` : `${interval} minutes`}
              </Typography>
              {editIdx === idx ? (
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 1, flexWrap: 'nowrap', width: '100%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', flex: 1 }}>
                    <FormControlLabel
                      control={<Checkbox checked={editRestartOnFail} onChange={e => setEditRestartOnFail(e.target.checked)} disabled={loading} />}
                      label={<span style={{ whiteSpace: 'nowrap' }}>Restart on Fail</span>}
                      sx={{ ml: 0 }}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={editNotifyOnFail} onChange={e => setEditNotifyOnFail(e.target.checked)} disabled={loading} />}
                      label={<span style={{ whiteSpace: 'nowrap' }}>Notify on Fail</span>}
                      sx={{ ml: 2 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 180, maxWidth: 220, ml: 2 }}>
                      <InputLabel id={`edit-interval-label-${idx}`}>Interval (min)</InputLabel>
                      <Select
                        labelId={`edit-interval-label-${idx}`}
                        value={editInterval}
                        label="Interval (min)"
                        onChange={e => setEditInterval(Number(e.target.value))}
                        disabled={loading}
                        MenuProps={{ disableScrollLock: true }}
                      >
                        {INTERVAL_OPTIONS.map(opt => (
                          <MenuItem key={opt} value={opt}>{opt} minutes</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flex: '0 0 auto', ml: 2, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" color="secondary" size="small" onClick={handleEditCancel} disabled={loading}>Cancel</Button>
                    <Button variant="contained" color="primary" size="small" onClick={() => handleEditSave(check)} disabled={loading}>Save</Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', mb: 1, flexWrap: 'nowrap' }}>
                  <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'nowrap' }}>
                    Restart on Fail: {check.restart_on_fail ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'nowrap', ml: 2 }}>
                    Notify on Fail: {check.notify_on_fail ? 'Yes' : 'No'}
                  </Typography>
                </Box>
              )}
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  fontWeight: 600,
                  color:
                    check.status === 'OK'
                      ? theme.palette.success.main
                      : check.status === 'Unknown'
                        ? theme.palette.warning.main
                        : theme.palette.error.main,
                }}
              >
                Status: {check.status || 'Unknown'}
              </Typography>
            </Box>
          ))}
        </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
}
