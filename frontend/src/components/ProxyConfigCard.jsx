import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider,
  Collapse
} from "@mui/material";
import ConfirmDialog from "./ConfirmDialog";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useSession } from '../context/SessionContext';

export default function ProxyConfigCard({ proxies, setProxies }) {
  const [sessions, setSessions] = useState([]);
  const [deleteLabel, setDeleteLabel] = useState(null);
  const [sessionsUsingProxy, setSessionsUsingProxy] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const { proxy, setProxy } = useSession();

  // Fetch sessions on mount and when proxies change
  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => setSessions(data.sessions || []));
  }, [proxies]);
  const [expanded, setExpanded] = useState(false);
  const [editLabel, setEditLabel] = useState("");
  const [editProxy, setEditProxy] = useState(null);
  const [form, setForm] = useState({ label: "", host: "", port: "", username: "", password: "" });
  const [isEditing, setIsEditing] = useState(false);

  // proxies and onProxiesChanged are managed by parent

  const handleExpand = () => {
    setExpanded(prev => !prev);
  };

  const handleInputChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = label => {
    setEditLabel(label);
    setEditProxy(proxies[label]);
    setForm(proxies[label]);
    setIsEditing(true);
    setExpanded(true);
  };

  const handleDelete = label => {
    setDeleteLabel(label);
    setSessionsUsingProxy([]);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    fetch(`/api/proxies/${deleteLabel}`, { method: "DELETE" })
      .then(() => {
        setShowConfirm(false);
        setDeleteLabel(null);
        setSessionsUsingProxy([]);
        // If the current session is using the deleted proxy, clear it immediately
        if (proxy?.label === deleteLabel && setProxy) {
          setProxy({});
        }
        // Remove the deleted proxy from local state
        setProxies(prev => {
          const updated = { ...prev };
          delete updated[deleteLabel];
          return updated;
        });
      });
  };

  const handleSave = () => {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `/api/proxies/${editLabel}` : "/api/proxies";
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(() => {
        setForm({ label: "", host: "", port: "", username: "", password: "" });
        setIsEditing(false);
        setEditLabel("");
        setEditProxy(null);
        // Update proxies state in-place
        setProxies(prev => {
          const updated = { ...prev };
          if (method === "PUT") {
            updated[editLabel] = { ...form };
          } else {
            updated[form.label] = { ...form };
          }
          return updated;
        });
      });
  };

  const handleAddNew = () => {
    setForm({ label: "", host: "", port: "", username: "", password: "" });
    setIsEditing(false);
    setEditLabel("");
    setEditProxy(null);
    setExpanded(true);
  };

  return (
    <>
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', px: 2, pt: 2, pb: 1.5, minHeight: 56 }} onClick={handleExpand}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
          Proxy Configuration
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandMoreIcon sx={{ transform: 'rotate(180deg)' }} /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          <Box>
            <Box component="form" onSubmit={e => e.preventDefault()} sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        <TextField label="Label" name="label" value={form.label} onChange={handleInputChange} disabled={isEditing} required size="small" sx={{ width: 220 }} variant="outlined" InputProps={{ style: { background: 'inherit' } }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Host" name="host" value={form.host} onChange={handleInputChange} required size="small" sx={{ width: 220 }} variant="outlined" />
                <TextField label="Port" name="port" value={form.port} onChange={handleInputChange} required type="number" size="small" sx={{ width: 120 }} variant="outlined" />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Username" name="username" value={form.username} onChange={handleInputChange} size="small" sx={{ width: 220 }} variant="outlined" />
                <TextField label="Password" name="password" value={form.password} onChange={handleInputChange} type="password" size="small" sx={{ width: 220 }} variant="outlined" />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, width: '100%' }}>
              <Button variant="outlined" color="secondary" onClick={handleAddNew} sx={{ minWidth: 100, mr: 2 }}>Clear</Button>
              <Button variant="contained" onClick={handleSave} sx={{ minWidth: 140 }}>{isEditing ? "Update Proxy" : "Save Proxy"}</Button>
            </Box>
            {Object.keys(proxies).length > 0 && <Divider sx={{ my: 2 }} />}
            {Object.keys(proxies).length === 0 && (
              <Typography sx={{ mt: 3, mb: 2, color: 'text.secondary', textAlign: 'center', fontStyle: 'italic' }}>
                No proxies configured.
              </Typography>
            )}
            {Object.entries(proxies).map(([label, proxy]) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ flex: 1, fontWeight: 400 }}>{label} ({proxy.host}:{proxy.port})</Typography>
                <IconButton onClick={() => handleEdit(label)}><EditIcon /></IconButton>
                <IconButton onClick={() => handleDelete(label)}><DeleteIcon /></IconButton>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Collapse>
    </Card>
    <ConfirmDialog
      open={showConfirm}
      onClose={() => setShowConfirm(false)}
      onConfirm={confirmDelete}
      title="Delete Proxy?"
      message={
        <span>
          <b>Warning:</b> Deleting this proxy will immediately remove it from any sessions that are using it.<br/>
          This action cannot be undone.<br/><br/>
          Are you sure you want to delete this proxy?
        </span>
      }
      confirmLabel="Delete"
      confirmColor="error"
    />
  </>
  );
}
