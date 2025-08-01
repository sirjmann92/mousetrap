import React, { useEffect, useState } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";

export default function SessionSelector({ selectedLabel, setSelectedLabel, onLoadSession }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetch("/api/sessions")
      .then(res => res.json())
      .then(data => setSessions(data.sessions || []));
  }, []);

  const handleChange = (e) => {
    setSelectedLabel(e.target.value);
    if (onLoadSession) onLoadSession(e.target.value);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Session</InputLabel>
        <Select value={selectedLabel} label="Session" onChange={handleChange}>
          {sessions.map(label => (
            <MenuItem key={label} value={label}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="outlined" sx={{ ml: 2 }} onClick={() => onLoadSession(selectedLabel)}>
        Load Session
      </Button>
    </Box>
  );
}
