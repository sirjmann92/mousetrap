import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, Button, Box, List, ListItem, ListItemText, IconButton, Alert, Tooltip, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Collapse, TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';

export default function PortMonitorCard() {
  const API_BASE = '/api/port-monitor';
  const fetchStacks = async () => {
    try {
      const res = await fetch('/api/port-monitor/stacks');
      if (!res.ok) throw new Error('Failed to fetch stacks');
      const data = await res.json();
      setStacks(data);
    } catch (e) {
      setStacks([]);
    }
  };
  // Fetch on mount
  useEffect(() => {
    fetchStacks();
  }, []);
  const [stacks, setStacks] = useState([]);
  const [containers, setContainers] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  // New/edit stack form state
  const [name, setName] = useState('');
  const [primaryContainer, setPrimaryContainer] = useState('');
  const [primaryPort, setPrimaryPort] = useState('');
  const [secondaryContainers, setSecondaryContainers] = useState([]);
  const [interval, setInterval] = useState(1);
  const [publicIp, setPublicIp] = useState('');
  const [editingStack, setEditingStack] = useState(null); // stack.name if editing, else null
  // 1, 5, 10, 15, ... 60 (minutes)
  // Helper to reset form state
  const resetForm = () => {
    setEditingStack(null);
    setName('');
    setPrimaryContainer('');
    setPrimaryPort('');
    setSecondaryContainers([]);
    setInterval(1);
    setPublicIp('');
  };
  const INTERVAL_OPTIONS = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

  // ...existing code...

  const fetchContainers = async () => {
    try {
      const res = await fetch('/api/port-monitor/containers');
      if (!res.ok) throw new Error('Failed to fetch containers');
      setContainers(await res.json());
    } catch (e) {
      setContainers([]);
    }
  };

  // Auto-hide success alert after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    fetchContainers();
  }, []);

  const handleAddStack = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/stacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          primary_container: primaryContainer,
          primary_port: Number(primaryPort),
          secondary_containers: secondaryContainers,
          interval,
          public_ip: publicIp || undefined
        })
      });
      if (!res.ok) throw new Error('Failed to add stack');
      setSuccess('Stack added.');
    } catch (e) {
      setError('Failed to add stack.');
    } finally {
      resetForm();
      await fetchStacks();
      setLoading(false);
    }
  };

  const handleEditStack = (stack) => {
  setEditingStack(stack.name);
  setName(stack.name);
  setPrimaryContainer(stack.primary_container);
  setPrimaryPort(stack.primary_port);
  setSecondaryContainers(stack.secondary_containers);
  setInterval(stack.interval);
  setPublicIp(typeof stack.public_ip === 'string' ? stack.public_ip : '');
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/stacks?name=${encodeURIComponent(editingStack)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_container: primaryContainer,
          primary_port: Number(primaryPort),
          secondary_containers: secondaryContainers,
          interval,
          public_ip: publicIp || undefined
        })
      });
      if (!res.ok) throw new Error('Failed to update stack');
      setSuccess('Stack updated.');
    } catch (e) {
      setError('Failed to update stack.');
    } finally {
      resetForm();
      await fetchStacks();
      setLoading(false);
    }
  };

const handleCancelEdit = () => {
  resetForm();
};

  const handleDeleteStack = async (name) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/stacks?name=${encodeURIComponent(name)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete stack');
      setSuccess('Stack deleted.');
      await fetchStacks();
      resetForm();
    } catch (e) {
      setError('Failed to delete stack.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestartStack = async (name) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/stacks/restart?name=${encodeURIComponent(name)}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to restart stack');
      setSuccess('Stack restart triggered.');
    } catch (e) {
      setError('Failed to restart stack.');
    }
    setLoading(false);
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', px: 2, pt: 2, pb: 1.5, minHeight: 56 }} onClick={() => setExpanded(e => !e)}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Docker Port Monitor
        </Typography>
        <IconButton size="small">
          <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'none' }} />
        </IconButton>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          {containers.length === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Docker socket permissions required:</strong> This feature requires access to the Docker socket. If you do not have permission, the list will be empty and actions will not work.
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
            Define a stack of containers to monitor and restart together. Select a primary container and port, and any secondary containers.
          </Typography>
          {error && stacks.length > 0 && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            {/* Always enable Stack Name field if not editing */}
            <TextField label="Stack Name" value={name} onChange={e => setName(e.target.value)} size="small" sx={{ minWidth: 220, maxWidth: 320 }} variant="outlined" disabled={Boolean(editingStack)} />
            <FormControl size="small" sx={{ minWidth: 220, maxWidth: 320 }}>
              <InputLabel id="primary-container-label">Primary Container</InputLabel>
              <Select
                labelId="primary-container-label"
                value={primaryContainer}
                label="Primary Container"
                onChange={e => setPrimaryContainer(e.target.value)}
                MenuProps={{ disableScrollLock: true }}
              >
                <MenuItem value="" disabled>{containers.length === 0 ? "No running containers" : "Select container"}</MenuItem>
                {containers.slice().sort().map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%' }}>
              <TextField label="Primary Port" type="number" value={primaryPort} onChange={e => setPrimaryPort(e.target.value)} size="small" sx={{ minWidth: 110, maxWidth: 130 }} />
              <FormControl size="small" sx={{ minWidth: 200, maxWidth: 260 }}>
                <InputLabel id="interval-select-label">Check Interval (min)</InputLabel>
                <Select
                  labelId="interval-select-label"
                  value={interval}
                  label="Check Interval (min)"
                  onChange={e => setInterval(Number(e.target.value))}
                  MenuProps={{ disableScrollLock: true }}
                >
                  {INTERVAL_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt} minutes</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="If the app cannot detect the public IP of the container automatically, enter it here to override. This is only needed if detection fails (e.g., curl/wget missing in container)." placement="top" arrow>
                <TextField label="Public IP (optional)" value={publicIp} onChange={e => setPublicIp(e.target.value)} size="small" sx={{ minWidth: 180, maxWidth: 240 }} helperText="Override detected public IP" />
              </Tooltip>
            </Box>
            <FormControl size="small" sx={{ minWidth: 220, maxWidth: 320 }} variant="outlined">
              <InputLabel id="secondary-containers-label">Secondary Containers</InputLabel>
              <Select
                labelId="secondary-containers-label"
                multiple
                value={secondaryContainers}
                onChange={e => setSecondaryContainers(e.target.value)}
                renderValue={selected => selected.join(', ')}
                label="Secondary Containers"
                MenuProps={{ disableScrollLock: true }}
              >
                {containers.filter(c => c !== primaryContainer).slice().sort().map(c => (
                  <MenuItem key={c} value={c}>
                    <Checkbox checked={secondaryContainers.indexOf(c) > -1} />
                    <ListItemText primary={c} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', width: '100%', gap: 1 }}>
              {editingStack ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveEdit}
                    disabled={!name || !primaryContainer || !primaryPort || loading}
                    sx={{ minWidth: 110 }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddStack}
                  disabled={!name || !primaryContainer || !primaryPort || loading}
                  sx={{ minWidth: 110 }}
                >
                  Add Stack
                </Button>
              )}
            </Box>
          </Box>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>Configured Stacks</Typography>
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {stacks.length === 0 && <Typography color="text.secondary">No stacks configured.</Typography>}
            {stacks.map((stack) => {
              // Show a warning if the backend could not detect a valid public IP and no override is set
              const needsPublicIp = stack.status === 'Failed' && (!stack.public_ip || stack.public_ip === '') && stack.public_ip_detected === false;
              return (
                <Box
                  key={stack.name}
                  sx={theme => ({
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    background: theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5',
                    boxShadow: 0,
                    position: 'relative',
                  })}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 320 }}>Stack: {stack.name}</Typography>
                    {stack.public_ip && stack.public_ip !== '' && (
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="caption" color="info.main" sx={{ fontWeight: 700, background: '#e3f2fd', px: 1, py: 0.5, borderRadius: 1 }}>
                          Public IP Override: {stack.public_ip}
                        </Typography>
                      </Box>
                    )}
                    <Box>
                      <Tooltip title="Edit Stack">
                        <IconButton size="small" onClick={() => handleEditStack(stack)}>
                          <EditIcon color="primary" fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Recheck Stack Status">
                        <IconButton size="small" onClick={async () => {
                          setLoading(true);
                          setError(null);
                          try {
                            await fetch(`${API_BASE}/stacks/recheck?name=${encodeURIComponent(stack.name)}`, { method: 'POST' });
                            await fetchStacks();
                            // Find the updated stack and show a notification
                            const updated = stacks.find(s => s.name === stack.name);
                            const statusMsg = updated ? (updated.status || 'Unknown') : 'Unknown';
                            setSuccess(`Stack rechecked: ${stack.name} — ${statusMsg}`);
                          } catch (e) {
                            setError('Failed to recheck stack.');
                          }
                          setLoading(false);
                        }}>
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Restart Stack">
                        <IconButton size="small" onClick={() => handleRestartStack(stack.name)}>
                          <RefreshIcon color="warning" fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Stack">
                        <IconButton size="small" onClick={() => handleDeleteStack(stack.name)}>
                          <DeleteIcon color="error" fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ minWidth: 320 }}>Primary: {stack.primary_container}:{stack.primary_port}</Typography>
                  <Typography variant="body2" sx={{ minWidth: 320 }}>Secondaries: {stack.secondary_containers.join(', ') || 'None'}</Typography>
                  <Typography variant="body2" sx={{ minWidth: 320 }}>
                    Check Interval: {stack.interval} {stack.interval === 1 ? 'minute' : 'minutes'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      minWidth: 320,
                      fontWeight: 600,
                      color:
                        stack.status === 'OK'
                          ? theme => theme.palette.success.main
                          : stack.status === 'Unknown'
                          ? theme => theme.palette.warning.main
                          : stack.status === 'Restarting...'
                          ? theme => theme.palette.warning.main
                          : theme => theme.palette.error.main,
                    }}
                  >
                    Status: {stack.status || 'Unknown'}
                  </Typography>
                  {needsPublicIp && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Unable to detect the public IP for this container. Please ensure <code>curl</code> or <code>wget</code> is installed in the container, or use the <b>Public IP (optional)</b> field above to override.
                    </Alert>
                  )}
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
}
