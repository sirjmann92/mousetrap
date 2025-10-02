import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DescriptionIcon from '@mui/icons-material/Description';
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useCallback, useEffect, useId, useState } from 'react';
import { getStatusMessageColor } from '../utils/utils';

export default function EventLogModalButton({ sessionLabel }) {
  const sessionFilterLabelId = useId();
  const eventTypeFilterLabelId = useId();
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
      const res = await fetch(`/api/ui_event_log?_=${Date.now()}`);
      if (!res.ok) throw new Error('Failed to fetch event log');
      const data = await res.json();
      // Collect all unique labels (excluding 'global') and event types
      const uniqueLabels = Array.from(
        new Set(data.map((e) => e.label).filter((l) => l && l !== 'global')),
      );
      setLabels(uniqueLabels);
      const uniqueEventTypes = Array.from(new Set(data.map((e) => e.event_type).filter(Boolean)));
      setEventTypes(uniqueEventTypes);
      // Filter by session and event type
      let filtered = data;
      if (sessionFilter === 'global') {
        filtered = filtered.filter((e) => e.label === 'global');
      } else if (sessionFilter !== 'all') {
        filtered = filtered.filter((e) => e.label === sessionFilter);
      }
      if (eventTypeFilter && eventTypeFilter !== 'all') {
        filtered = filtered.filter((e) => e.event_type === eventTypeFilter);
      }
      setLog([...filtered].reverse());
    } catch (e) {
      setError(e.message || 'Failed to load event log');
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
    return log.filter(
      (e) => !e.status_message || !/no change detected|no change needed/i.test(e.status_message),
    );
  };

  // Clear log handler (session-specific if sessionLabel is set)
  const handleClear = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/ui_event_log';
      // Use the session filter from the modal dropdown, not the parent page's sessionLabel
      if (sessionFilter && sessionFilter !== 'all') {
        url += `/${encodeURIComponent(sessionFilter)}`;
      }
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to clear event log');
      setLog([]);
    } catch (e) {
      setError(e.message || 'Failed to clear event log');
    } finally {
      setLoading(false);
    }
  };

  // Build dropdown options
  const sessionDropdownOptions = [
    { label: 'Global', value: 'global' },
    { label: 'All Sessions', value: 'all' },
    ...labels.map((l) => ({ label: l, value: l })),
  ];
  const eventTypeDropdownOptions = [
    { label: 'All Event Types', value: 'all' },
    ...eventTypes.map((t) => ({
      label: t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: t,
    })),
  ];

  // Color coding by event type
  const eventTypeColors = {
    automation: '#7b1fa2',
    manual: '#388e3c',
    port_monitor_add: '#1976d2',
    port_monitor_check: '#0288d1',
    port_monitor_delete: '#d32f2f',
    // Add more as needed
  };

  // Custom scrollbar styling
  const ScrollBox = styled(Box)(({ theme }) => ({
    '&::-webkit-scrollbar': {
      background: theme.palette.mode === 'dark' ? '#222' : '#fafbfc',
      width: 8,
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.mode === 'dark' ? '#444' : '#bbb',
      borderRadius: 4,
    },
    maxHeight: 400,
    overflowY: 'auto',
    paddingRight: 2,
    scrollbarColor: theme.palette.mode === 'dark' ? '#444 #222' : '#bbb #fafbfc',
    scrollbarWidth: 'thin',
  }));

  return (
    <>
      <Tooltip title="View Event Log">
        <IconButton color="inherit" onClick={() => setOpen(true)} size="medium">
          <DescriptionIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        disableScrollLock={true}
        fullWidth
        maxWidth="md"
        onClose={() => setOpen(false)}
        open={open}
        PaperProps={{
          sx: {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? '#1F1F1E' : theme.palette.background.default,
            borderRadius: 2,
          },
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? '#1F1F1E' : theme.palette.background.default,
            display: 'flex',
            justifyContent: 'space-between',
            pl: 3,
            pr: 1,
            pt: 2,
          }}
        >
          <DialogTitle sx={{ borderRadius: 0, p: 0 }}>Event Log</DialogTitle>
          <Box sx={{ borderRadius: 2 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchLog} size="small" sx={{ mr: 1 }}>
                <svg
                  aria-label="Refresh"
                  fill="none"
                  height="20"
                  role="img"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="20"
                >
                  <title>Refresh</title>
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0114.13-3.36L23 10"></path>
                  <path d="M20.49 15A9 9 0 015.87 18.36L1 14"></path>
                </svg>
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear log">
              <IconButton onClick={handleClear} size="small" sx={{ mr: 1 }}>
                <svg
                  aria-label="Clear log"
                  fill="none"
                  height="20"
                  role="img"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="20"
                >
                  <title>Clear log</title>
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                </svg>
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
        <DialogContent
          dividers
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? '#1F1F1E' : theme.palette.background.default,
          }}
        >
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'row',
              mb: 2,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={showNoChange}
                  color="primary"
                  onChange={(e) => setShowNoChange(e.target.checked)}
                />
              }
              label="Show 'No Change Needed' Entries"
              sx={{ ml: 0, mr: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id={sessionFilterLabelId}>Session</InputLabel>
                <Select
                  label="Session"
                  labelId={sessionFilterLabelId}
                  onChange={(e) => setSessionFilter(e.target.value)}
                  value={sessionFilter}
                >
                  {sessionDropdownOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id={eventTypeFilterLabelId}>Event Type</InputLabel>
                <Select
                  label="Event Type"
                  labelId={eventTypeFilterLabelId}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  value={eventTypeFilter}
                >
                  {eventTypeDropdownOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          {loading ? (
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'center',
                minHeight: 60,
              }}
            >
              <CircularProgress size={28} />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : getVisibleLog().length === 0 ? (
            <Typography color="text.secondary">No events yet.</Typography>
          ) : (
            <ScrollBox>
              {getVisibleLog().map((event) => (
                <Box
                  key={`${event.timestamp || 'no-ts'}-${event.label || 'no-label'}`}
                  sx={{
                    background: (theme) => (theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5'),
                    border: 'none',
                    borderRadius: 2,
                    mb: 2,
                    mr: 0.5,
                    p: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      color: (theme) =>
                        theme.palette.mode === 'dark' ? '#b0b0b0' : 'text.secondary',
                    }}
                    variant="caption"
                  >
                    {/* Show a readable date, or placeholder if timestamp is missing/invalid */}
                    {(() => {
                      const ts = event.timestamp;
                      if (!ts || ts === 0 || ts === '0' || ts === 'null' || ts === 'undefined')
                        return <span style={{ color: '#c00' }}>No Timestamp</span>;
                      const d = new Date(ts);
                      if (Number.isNaN(d.getTime()))
                        return <span style={{ color: '#c00' }}>Invalid Timestamp</span>;
                      return d.toLocaleString();
                    })()} — <b>{event.label === 'global' ? 'Global' : event.label}</b>
                  </Typography>
                  <Typography
                    sx={{
                      color: (() => {
                        const statusColor = getStatusMessageColor(event.status_message);
                        if (statusColor === 'error.main') return statusColor;
                        return eventTypeColors[event.event_type] || statusColor;
                      })(),
                      fontWeight: 500,
                      mt: 0.5,
                    }}
                    variant="body2"
                  >
                    {event.status_message}
                  </Typography>
                  {event.details && (
                    <Box
                      sx={{
                        color: (theme) => (theme.palette.mode === 'dark' ? '#e0e0e0' : '#555'),
                        fontSize: 13,
                        mt: 0.5,
                      }}
                    >
                      {event.details.ip_compare && <span>IP: {event.details.ip_compare} </span>}
                      {event.details.asn_compare && <span>ASN: {event.details.asn_compare} </span>}
                      {event.details.points !== undefined && (
                        <span>Points: {event.details.points}</span>
                      )}
                      {event.details.container && (
                        <span>Container: {event.details.container} </span>
                      )}
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
