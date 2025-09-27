import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Collapse,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useId, useState } from 'react';

export default function PortMonitorCard() {
  const API_BASE = '/api/port-monitor';
  const fetchStacks = useCallback(async () => {
    try {
      const res = await fetch('/api/port-monitor/stacks');
      if (!res.ok) throw new Error('Failed to fetch stacks');
      const data = await res.json();
      setStacks(data);
    } catch (_e) {
      setStacks([]);
    }
  }, []);
  // Fetch on mount
  useEffect(() => {
    fetchStacks();
  }, [fetchStacks]);
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

  const fetchContainers = useCallback(async () => {
    try {
      const res = await fetch('/api/port-monitor/containers');
      if (!res.ok) throw new Error('Failed to fetch containers');
      setContainers(await res.json());
    } catch (_e) {
      setContainers([]);
    }
  }, []);

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
  }, [fetchContainers]);

  // Generate unique ids for InputLabel components to satisfy accessibility
  const primaryContainerId = useId();
  const intervalSelectId = useId();
  const secondaryContainersId = useId();

  const handleAddStack = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/stacks`, {
        body: JSON.stringify({
          interval,
          name,
          primary_container: primaryContainer,
          primary_port: Number(primaryPort),
          public_ip: publicIp || undefined,
          secondary_containers: secondaryContainers,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to add stack');
      setSuccess('Stack added.');
    } catch (_e) {
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
        body: JSON.stringify({
          interval,
          primary_container: primaryContainer,
          primary_port: Number(primaryPort),
          public_ip: publicIp || undefined,
          secondary_containers: secondaryContainers,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      });
      if (!res.ok) throw new Error('Failed to update stack');
      setSuccess('Stack updated.');
    } catch (_e) {
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
      const res = await fetch(`${API_BASE}/stacks?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete stack');
      setSuccess('Stack deleted.');
      await fetchStacks();
      resetForm();
    } catch (_e) {
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
      const res = await fetch(`${API_BASE}/stacks/restart?name=${encodeURIComponent(name)}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to restart stack');
      setSuccess('Stack restart triggered.');
    } catch (_e) {
      setError('Failed to restart stack.');
    }
    setLoading(false);
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 2, mb: 3 }}>
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
              <strong>Docker socket permissions required:</strong> This feature requires access to
              the Docker socket. If you do not have permission, the list will be empty and actions
              will not work.
            </Alert>
          )}
          <Typography color="text.secondary" gutterBottom sx={{ mb: 1 }} variant="body2">
            Define a stack of containers to monitor and restart together. Select a primary container
            and port, and any secondary containers.
          </Typography>
          {error && stacks.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 1 }}>
              {success}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            {/* Always enable Stack Name field if not editing */}
            <TextField
              disabled={Boolean(editingStack)}
              label="Stack Name"
              onChange={(e) => setName(e.target.value)}
              size="small"
              sx={{ maxWidth: 350, minWidth: 220 }}
              value={name}
              variant="outlined"
            />
            <FormControl size="small" sx={{ maxWidth: 350, minWidth: 220 }}>
              <InputLabel id={primaryContainerId}>Primary Container</InputLabel>
              <Select
                label="Primary Container"
                labelId={primaryContainerId}
                MenuProps={{ disableScrollLock: true }}
                onChange={(e) => setPrimaryContainer(e.target.value)}
                value={primaryContainer}
              >
                <MenuItem disabled value="">
                  {containers.length === 0 ? 'No running containers' : 'Select container'}
                </MenuItem>
                {containers
                  .slice()
                  .sort()
                  .map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 2,
                width: '100%',
              }}
            >
              <TextField
                label="Primary Port"
                onChange={(e) => setPrimaryPort(e.target.value)}
                size="small"
                sx={{ maxWidth: 130, minWidth: 110 }}
                type="number"
                value={primaryPort}
              />
              <FormControl size="small" sx={{ maxWidth: 260, minWidth: 200 }}>
                <InputLabel id={intervalSelectId}>Check Interval (min)</InputLabel>
                <Select
                  label="Check Interval (min)"
                  labelId={intervalSelectId}
                  MenuProps={{ disableScrollLock: true }}
                  onChange={(e) => setInterval(Number(e.target.value))}
                  value={interval}
                >
                  {INTERVAL_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt} minutes
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip
                arrow
                placement="top"
                title="If the app cannot detect the public IP of the container automatically, enter it here to override. This is only needed if detection fails (e.g., curl/wget missing in container)."
              >
                <TextField
                  label="Public IP (optional)"
                  onChange={(e) => setPublicIp(e.target.value)}
                  size="small"
                  sx={{ maxWidth: 210, minWidth: 150 }}
                  value={publicIp}
                />
              </Tooltip>
            </Box>
            <FormControl size="small" sx={{ maxWidth: 350, minWidth: 220 }} variant="outlined">
              <InputLabel id={secondaryContainersId}>Secondary Containers</InputLabel>
              <Select
                label="Secondary Containers"
                labelId={secondaryContainersId}
                MenuProps={{ disableScrollLock: true }}
                multiple
                onChange={(e) => setSecondaryContainers(e.target.value)}
                renderValue={(selected) => selected.join(', ')}
                value={secondaryContainers}
              >
                {containers
                  .filter((c) => c !== primaryContainer)
                  .slice()
                  .sort()
                  .map((c) => (
                    <MenuItem key={c} value={c}>
                      <Checkbox checked={secondaryContainers.indexOf(c) > -1} />
                      <ListItemText primary={c} />
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                justifyContent: 'flex-end',
                width: '100%',
              }}
            >
              {editingStack ? (
                <>
                  <Button
                    color="primary"
                    disabled={!name || !primaryContainer || !primaryPort || loading}
                    onClick={handleSaveEdit}
                    sx={{ minWidth: 110 }}
                    variant="contained"
                  >
                    Save Changes
                  </Button>
                  <Button
                    color="secondary"
                    disabled={loading}
                    onClick={handleCancelEdit}
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  disabled={!name || !primaryContainer || !primaryPort || loading}
                  onClick={handleAddStack}
                  startIcon={<AddIcon />}
                  sx={{ minWidth: 110 }}
                  variant="contained"
                >
                  Add Stack
                </Button>
              )}
            </Box>
          </Box>
          <Typography sx={{ fontWeight: 600, mb: 1, mt: 2 }} variant="subtitle2">
            Configured Stacks
          </Typography>
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {stacks.length === 0 && (
              <Typography color="text.secondary">No stacks configured.</Typography>
            )}
            {stacks.map((stack) => {
              // Show a warning if the backend could not detect a valid public IP and no override is set
              const needsPublicIp =
                stack.status === 'Failed' &&
                (!stack.public_ip || stack.public_ip === '') &&
                stack.public_ip_detected === false;
              return (
                <Box
                  key={stack.name}
                  sx={(theme) => ({
                    background: theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5',
                    borderRadius: 2,
                    boxShadow: 0,
                    mb: 2,
                    p: 2,
                    position: 'relative',
                  })}
                >
                  <Box
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, minWidth: 320 }} variant="subtitle2">
                      Stack: {stack.name}
                    </Typography>
                    {stack.public_ip && stack.public_ip !== '' && (
                      <Box sx={{ ml: 2 }}>
                        <Typography
                          color="info.main"
                          sx={{
                            background: '#e3f2fd',
                            borderRadius: 1,
                            fontWeight: 700,
                            px: 1,
                            py: 0.5,
                          }}
                          variant="caption"
                        >
                          Public IP Override: {stack.public_ip}
                        </Typography>
                      </Box>
                    )}
                    <Box>
                      <Tooltip title="Edit Stack">
                        <IconButton onClick={() => handleEditStack(stack)} size="small">
                          <EditIcon color="primary" fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Recheck Stack Status">
                        <IconButton
                          onClick={async () => {
                            setLoading(true);
                            setError(null);
                            try {
                              await fetch(
                                `${API_BASE}/stacks/recheck?name=${encodeURIComponent(stack.name)}`,
                                { method: 'POST' },
                              );
                              // Wait a moment for the backend to update
                              await new Promise((resolve) => setTimeout(resolve, 100));
                              // Fetch fresh data
                              await fetchStacks();
                              // Get the updated status from fresh data
                              const freshData = await fetch('/api/port-monitor/stacks').then((r) =>
                                r.json(),
                              );
                              const updated = freshData.find((s) => s.name === stack.name);
                              const statusMsg = updated ? updated.status || 'Unknown' : 'Unknown';
                              setSuccess(`Stack rechecked: ${stack.name} — ${statusMsg}`);
                            } catch (_e) {
                              setError('Failed to recheck stack.');
                            }
                            setLoading(false);
                          }}
                          size="small"
                        >
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Restart Stack">
                        <IconButton onClick={() => handleRestartStack(stack.name)} size="small">
                          <RefreshIcon color="warning" fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Stack">
                        <IconButton onClick={() => handleDeleteStack(stack.name)} size="small">
                          <DeleteIcon color="error" fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography sx={{ minWidth: 320 }} variant="body2">
                    Primary: {stack.primary_container}:{stack.primary_port}
                  </Typography>
                  <Typography sx={{ minWidth: 320 }} variant="body2">
                    Secondaries: {stack.secondary_containers.join(', ') || 'None'}
                  </Typography>
                  <Typography sx={{ minWidth: 320 }} variant="body2">
                    Check Interval: {stack.interval} {stack.interval === 1 ? 'minute' : 'minutes'}
                  </Typography>
                  <Typography
                    sx={{
                      color:
                        stack.status === 'OK'
                          ? (theme) => theme.palette.success.main
                          : stack.status === 'Unknown'
                            ? (theme) => theme.palette.warning.main
                            : stack.status === 'Restarting...'
                              ? (theme) => theme.palette.warning.main
                              : (theme) => theme.palette.error.main,
                      fontWeight: 600,
                      minWidth: 320,
                    }}
                    variant="body2"
                  >
                    Status: {stack.status || 'Unknown'}
                  </Typography>
                  {needsPublicIp && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Unable to detect the public IP for this container. Please ensure{' '}
                      <code>curl</code> or <code>wget</code> is installed in the container, or use
                      the <b>Public IP (optional)</b> field above to override.
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
