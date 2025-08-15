import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button, TextField, Box, List, ListItem, ListItemText, IconButton, Alert, Tooltip, Accordion, AccordionSummary, AccordionDetails, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const API_BASE = '/api/port-monitor';

export default function PortMonitorCard() {
  const [containers, setContainers] = useState([]);
  const [checks, setChecks] = useState([]);
  const [port, setPort] = useState('');
  const [containerName, setContainerName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dockerPermission, setDockerPermission] = useState(false);

  // Fetch containers and checks on mount
  useEffect(() => {
    fetchContainers();
    fetchChecks();
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
      setContainers(data);
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

  const handleAddCheck = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/checks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ container_name: containerName, port: Number(port) })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || data.error || 'Failed to add port check.');
      } else {
        setSuccess('Port check added.');
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
        {!dockerPermission && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Docker Engine permissions are required to use Port Monitoring.
          </Alert>
        )}
        {error && error !== 'Docker Engine permission error.' && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert>}
        <Typography variant="subtitle2" sx={{ mt: 2 }}>Active Port Checks</Typography>
        <List dense>
          {checks.length === 0 && <ListItem><ListItemText primary="No port checks configured." /></ListItem>}
          {checks.map((check, idx) => (
            <ListItem
              key={check.container_name + ':' + check.port}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteCheck(check.container_name, check.port)} disabled={!dockerPermission || loading}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${check.container_name}:${check.port}`}
                secondary={check.status ? `Status: ${check.status}` : null}
              />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
