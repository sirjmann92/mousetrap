import React, { useEffect, useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, CircularProgress, Alert } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function EventLogPanel({ sessionLabel }) {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function fetchLog() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/logs/ui_event_log.json?_=" + Date.now());
        if (!res.ok) throw new Error("Failed to fetch event log");
        const data = await res.json();
        // Optionally filter by sessionLabel
        const filtered = sessionLabel ? data.filter(e => e.label === sessionLabel) : data;
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
  }, [sessionLabel]);

  return (
    <Accordion sx={{ mt: 2, mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Event Log</Typography>
      </AccordionSummary>
      <AccordionDetails>
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
                  {new Date(event.timestamp).toLocaleString()} — <b>{event.label}</b>
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
                    {event.details.ip && <span>IP: {event.details.ip} </span>}
                    {event.details.asn && <span>ASN: {event.details.asn} </span>}
                    {event.details.points !== undefined && <span>Points: {event.details.points}</span>}
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
