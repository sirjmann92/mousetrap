import React, { useEffect, useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function EventLogPanel({ sessionLabel, allSessionLabels = [] }) {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(sessionLabel || 'all');
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    let ignore = false;
    async function fetchLog() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/logs/ui_event_log.json?_=" + Date.now());
        if (!res.ok) throw new Error("Failed to fetch event log");
        const data = await res.json();
        // Collect all unique labels
        const uniqueLabels = Array.from(new Set(data.map(e => e.label).filter(Boolean)));
        setLabels(uniqueLabels);
        // Filter by dropdown
        let filtered = data;
        if (filter && filter !== 'all') {
          filtered = data.filter(e => e.label === filter);
        }
        if (!ignore) setLog(filtered.reverse()); // newest first
      } catch (e) {
        if (!ignore) setError(e.message || "Failed to load event log");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchLog();
    // Optionally poll for updates every 10s
    const interval = setInterval(fetchLog, 10000);
    return () => { ignore = true; clearInterval(interval); };
  }, [filter]);

  // Build dropdown options: all, global, and all session labels
  const dropdownOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'global', label: 'Global Events' },
    ...allSessionLabels.map(l => ({ value: l, label: l }))
  ];

  return (
    <Accordion sx={{ mt: 2, mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Event Log</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormControl size="small" sx={{ minWidth: 180, mb: 2 }}>
          <InputLabel id="eventlog-filter-label">Filter</InputLabel>
          <Select
            labelId="eventlog-filter-label"
            value={filter}
            label="Filter"
            onChange={e => setFilter(e.target.value)}
          >
            {dropdownOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 60 }}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : log.length === 0 ? (
          <Typography color="text.secondary">No events yet.</Typography>
        ) : (
          <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
            {log.map((event, idx) => (
              <Box key={idx} sx={{ mb: 2, p: 1.5, border: '1px solid #eee', borderRadius: 1, background: '#fafbfc' }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(event.timestamp).toLocaleString()} — <b>{event.label === 'global' ? 'Global' : event.label}</b>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    fontWeight: 500,
                    color:
                      event.status_message === "No change detected. Update not needed."
                        ? "#43a047" // green
                        : undefined,
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
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
