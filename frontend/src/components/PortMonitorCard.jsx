import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import { Card, CardContent, Typography, Button, TextField, Box, List, ListItem, ListItemText, IconButton, Alert, Tooltip, Accordion, AccordionSummary, AccordionDetails, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const API_BASE = '/api/port-monitor';
const INTERVAL_OPTIONS = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

export default function PortMonitorCard() {
  const theme = useTheme();
  const [containers, setContainers] = useState([]);
  const [checks, setChecks] = useState([]);
  const [port, setPort] = useState('');
  const [containerName, setContainerName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dockerPermission, setDockerPermission] = useState(false);
  const [interval, setInterval] = useState(60);
  const [intervalLoading, setIntervalLoading] = useState(false);

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
        setDockerPermission(false);
        setError('Docker Engine permission error.');
        return;
      }
      const data = await res.json();
  setContainers(data.sort((a, b) => a.localeCompare(b)));
      setDockerPermission(true);
    } catch (e) {
      setDockerPermission(false);
      setError('Failed to fetch containers.');
    }
  };

  const fetchChecks = async () => {
    try {
      const res = await fetch(`${API_BASE}/checks`);
      if (!res.ok) {
        setDockerPermission(false);
        setError('Docker Engine permission error.');
        return;
      }
      const data = await res.json();
      setChecks(data);
      setDockerPermission(true);
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
        body: JSON.stringify({ container_name: containerName, port: Number(port), interval: Number(interval) })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || data.error || 'Failed to add port check.');
      } else {
        setSuccess('Port check added.');
        setTimeout(() => setSuccess(null), 2000);
        setPort('');
        setContainerName('');
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
    <Accordion sx={{ mb: 2 }} defaultExpanded={false}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Port Monitoring</Typography>
      </AccordionSummary>
      <AccordionDetails>
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
              >
                <MenuItem value="" disabled>{containers.length === 0 ? "No running containers" : "Select container"}</MenuItem>
                {containers.map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Only running containers are shown. Container must be running to appear in the list.">
              <IconButton size="small" tabIndex={-1} sx={{ ml: -1, mr: 1 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
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
              >
                {INTERVAL_OPTIONS.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt} minutes</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
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
        <Typography variant="subtitle2" sx={{ mt: 2 }}>Active Port Checks</Typography>
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {checks.length === 0 && <Typography color="text.secondary">No port checks configured.</Typography>}
          {checks.map((check, idx) => (
            <Box
              key={check.container_name + ':' + check.port}
              sx={{
                mb: 2,
                p: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                background: theme.palette.background.paper,
                boxShadow: 1,
                position: 'relative',
              }}
            >
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
      </AccordionDetails>
    </Accordion>
  );
}
