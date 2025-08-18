import React, { useState, useEffect, useCallback } from "react";
import { FormControlLabel, Switch, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, IconButton, Tooltip, Typography, Box, CircularProgress, Alert, useTheme } from "@mui/material";
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';

export default function EventLogModalButton({ sessionLabel, allSessionLabels = [] }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState([]);
  const [showNoChange, setShowNoChange] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionFilter, setSessionFilter] = useState(sessionLabel || 'all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [labels, setLabels] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);


  // Fetch log from backend
  const fetchLog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ui_event_log?_=" + Date.now());
      if (!res.ok) throw new Error("Failed to fetch event log");
      const data = await res.json();
      // Collect all unique labels (excluding 'global') and event types
      const uniqueLabels = Array.from(new Set(data.map(e => e.label).filter(l => l && l !== 'global')));
      setLabels(uniqueLabels);
      const uniqueEventTypes = Array.from(new Set(data.map(e => e.event_type).filter(Boolean)));
      setEventTypes(uniqueEventTypes);
      // Filter by session and event type
      let filtered = data;
      if (sessionFilter === 'global') {
        filtered = filtered.filter(e => e.label === 'global');
      } else if (sessionFilter !== 'all') {
        filtered = filtered.filter(e => e.label === sessionFilter);
      }
      if (eventTypeFilter && eventTypeFilter !== 'all') {
        filtered = filtered.filter(e => e.event_type === eventTypeFilter);
      }
      setLog(filtered.reverse());
    } catch (e) {
      setError(e.message || "Failed to load event log");
    } finally {
      setLoading(false);
    }
  }, [sessionFilter, eventTypeFilter]);

  // Fetch log when modal opens or filter changes
  useEffect(() => {
    if (open) fetchLog();
  }, [open, fetchLog]);

  // Copy all currently displayed log entries (as shown in the modal)
  const handleCopy = () => {
    try {
      // Copy only visible log entries (after filter)
      const visible = getVisibleLog();
      navigator.clipboard.writeText(JSON.stringify(visible, null, 2));
    } catch {}
  };

  // Helper to get visible log entries based on filter
  const getVisibleLog = () => {
    if (showNoChange) return log;
    return log.filter(e => !e.status_message || !/no change detected|no change needed/i.test(e.status_message));
  };

  // Clear log handler (session-specific if sessionLabel is set)
  const handleClear = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "/api/ui_event_log";
      if (sessionLabel) {
        url += `/${encodeURIComponent(sessionLabel)}`;
      }
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear event log");
      setLog([]);
    } catch (e) {
      setError(e.message || "Failed to clear event log");
    } finally {
      setLoading(false);
    }
  };

  // Build dropdown options
  const sessionDropdownOptions = [
    { value: 'global', label: 'Global' },
    { value: 'all', label: 'All Sessions' },
    ...labels.map(l => ({ value: l, label: l }))
  ];
  const eventTypeDropdownOptions = [
    { value: 'all', label: 'All Event Types' },
    ...eventTypes.map(t => ({ value: t, label: t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }))
  ];

  // Color coding by event type
  const eventTypeColors = {
    port_monitor_add: '#1976d2',
    port_monitor_check: '#0288d1',
    port_monitor_delete: '#d32f2f',
    automation: '#7b1fa2',
    manual: '#388e3c',
    // Add more as needed
  };

  // Custom scrollbar styling
  const ScrollBox = styled(Box)(({ theme }) => ({
    maxHeight: 400,
    overflowY: 'auto',
    paddingRight: 2,
    scrollbarColor: theme.palette.mode === 'dark' ? '#444 #222' : '#bbb #fafbfc',
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': {
      width: 8,
      background: theme.palette.mode === 'dark' ? '#222' : '#fafbfc',
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.mode === 'dark' ? '#444' : '#bbb',
      borderRadius: 4,
    },
  }));

  return (
    <>
      <Tooltip title="View Event Log">
        <IconButton color="inherit" onClick={() => setOpen(true)} size="medium">
          <DescriptionIcon />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pl: 3, pr: 1, pt: 2 }}>
          <DialogTitle sx={{ p: 0 }}>Event Log</DialogTitle>
          <Box>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchLog} size="small" sx={{ mr: 1 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0114.13-3.36L23 10"></path><path d="M20.49 15A9 9 0 015.87 18.36L1 14"></path></svg>
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear log">
              <IconButton onClick={handleClear} size="small" sx={{ mr: 1 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path></svg>
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy log as JSON">
              <IconButton onClick={handleCopy} size="small" sx={{ mr: 1 }}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton onClick={() => setOpen(false)} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexDirection: 'row' }}>
            <FormControlLabel
              control={<Switch checked={showNoChange} onChange={e => setShowNoChange(e.target.checked)} color="primary" />}
              label="Show 'No Change Needed' Entries"
              sx={{ ml: 0, mr: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="eventlog-session-filter-label">Session</InputLabel>
                <Select
                  labelId="eventlog-session-filter-label"
                  value={sessionFilter}
                  label="Session"
                  onChange={e => setSessionFilter(e.target.value)}
                >
                  {sessionDropdownOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="eventlog-type-filter-label">Event Type</InputLabel>
                <Select
                  labelId="eventlog-type-filter-label"
                  value={eventTypeFilter}
                  label="Event Type"
                  onChange={e => setEventTypeFilter(e.target.value)}
                >
                  {eventTypeDropdownOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 60 }}>
              <CircularProgress size={28} />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : getVisibleLog().length === 0 ? (
            <Typography color="text.secondary">No events yet.</Typography>
          ) : (
            <ScrollBox>
              {getVisibleLog().map((event, idx) => (
                <Box
                  key={idx}
                  sx={{
                    mb: 2,
                    p: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    background: theme.palette.background.paper,
                    mr: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {new Date(event.timestamp).toLocaleString()} — <b>{event.label === 'global' ? 'Global' : event.label}</b>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      fontWeight: 500,
                      color:
                        eventTypeColors[event.event_type] ||
                        (event.status_message === "No change detected. Update not needed."
                          ? "#43a047"
                          : undefined),
                    }}
                  >
                    {event.status_message}
                  </Typography>
                  {event.details && (
                    <Box sx={{ mt: 0.5, fontSize: 13, color: '#555' }}>
                      {event.details.ip_compare && <span>IP: {event.details.ip_compare} </span>}
                      {event.details.asn_compare && <span>ASN: {event.details.asn_compare} </span>}
                      {event.details.points !== undefined && <span>Points: {event.details.points}</span>}
                      {event.details.container && <span>Container: {event.details.container} </span>}
                      {event.details.port && <span>Port: {event.details.port}</span>}
                    </Box>
                  )}
                </Box>
              ))}
            </ScrollBox>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
