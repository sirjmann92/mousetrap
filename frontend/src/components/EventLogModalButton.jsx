import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Tooltip, Typography, Box, CircularProgress, Alert, useTheme } from "@mui/material";
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function EventLogModalButton({ sessionLabel }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // Fetch log from backend
  const fetchLog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ui_event_log?_=" + Date.now());
      if (!res.ok) throw new Error("Failed to fetch event log");
      const data = await res.json();
      const filtered = sessionLabel ? data.filter(e => e.label === sessionLabel) : data;
      setLog(filtered.reverse());
    } catch (e) {
      setError(e.message || "Failed to load event log");
    } finally {
      setLoading(false);
    }
  }, [sessionLabel]);

  // Fetch log when modal opens
  useEffect(() => {
    if (open) fetchLog();
  }, [open, fetchLog]);


  // Copy all currently displayed log entries (as shown in the modal)
  const handleCopy = () => {
    try {
      // Copy all visible log entries (not just a subset)
      const allVisible = Array.isArray(log) ? [...log] : [];
      navigator.clipboard.writeText(JSON.stringify(allVisible, null, 2));
    } catch {}
  };

  // Clear log handler
  const handleClear = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ui_event_log", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear event log");
      setLog([]);
    } catch (e) {
      setError(e.message || "Failed to clear event log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title="View Event Log">
        <IconButton color="inherit" onClick={() => setOpen(true)} size="large">
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
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 60 }}>
              <CircularProgress size={28} />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : log.length === 0 ? (
            <Typography color="text.secondary">No events yet.</Typography>
          ) : (
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {log.map((event, idx) => (
                <Box
                  key={idx}
                  sx={{
                    mb: 2,
                    p: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    background: theme.palette.background.paper,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {new Date(event.timestamp).toLocaleString()} — <b>{event.label}</b>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                    {event.status_message}
                  </Typography>
                  {event.details && (
                    <Box sx={{ mt: 0.5, fontSize: 13, color: theme.palette.text.secondary }}>
                      {event.details.ip && <span>IP: {event.details.ip} </span>}
                      {event.details.asn && <span>ASN: {event.details.asn} </span>}
                      {event.details.points !== undefined && <span>Points: {event.details.points}</span>}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
