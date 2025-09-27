import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { useSession } from '../context/SessionContext';

export default function SessionSelector({ onLoadSession, onCreateSession, onDeleteSession, sx }) {
  const { sessionLabel: selectedLabel, setSessionLabel: setSelectedLabel } = useSession();
  const [sessions, setSessions] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetch('/api/sessions')
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []));
  }, []);

  const handleChange = (e) => {
    setSelectedLabel(e.target.value);
    if (onLoadSession) onLoadSession(e.target.value);
    // Only persist to backend if the label exists in the sessions list
    if (sessions.includes(e.target.value)) {
      fetch('/api/last_session', {
        body: JSON.stringify({ label: e.target.value }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    onDeleteSession(selectedLabel);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', ...sx }}>
      <FormControl size="small" sx={{ maxWidth: 240, minWidth: 160 }}>
        <InputLabel>Session</InputLabel>
        <Select
          label="Session"
          MenuProps={{ disableScrollLock: true }}
          onChange={handleChange}
          sx={{ width: 180 }}
          value={selectedLabel}
        >
          {sessions.map((label) => (
            <MenuItem key={label} value={label}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Tooltip title="Create New Session">
        <IconButton color="success" onClick={onCreateSession} sx={{ ml: 1 }}>
          <AddCircleOutlineIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete Session">
        <span>
          <IconButton
            color="error"
            disabled={sessions.length === 0}
            onClick={handleDeleteClick}
            sx={{ ml: 1 }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Dialog disableScrollLock={true} onClose={handleDeleteCancel} open={deleteDialogOpen}>
        <DialogTitle>Delete Session</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete session <b>{selectedLabel}</b>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleDeleteCancel} variant="outlined">
            Cancel
          </Button>
          <Button color="error" onClick={handleDeleteConfirm} variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
