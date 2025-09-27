import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSession } from '../context/SessionContext';
import ConfirmDialog from './ConfirmDialog';

export default function ProxyConfigCard({ proxies, setProxies, refreshProxies }) {
  const [_sessions, setSessions] = useState([]);
  const [deleteLabel, setDeleteLabel] = useState(null);
  const [_sessionsUsingProxy, setSessionsUsingProxy] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const { proxy, setProxy } = useSession();

  // State declarations must come before useEffect hooks that reference them
  const [expanded, setExpanded] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [_editProxy, setEditProxy] = useState(null);
  const [form, setForm] = useState({
    label: '',
    host: '',
    port: '',
    username: '',
    password: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [testingProxy, setTestingProxy] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Fetch sessions on mount and when proxies change
  useEffect(() => {
    fetch('/api/sessions')
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []));
  }, [proxies]);

  // Auto-dismiss success messages after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss error messages after 2 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // proxies and onProxiesChanged are managed by parent

  const handleExpand = () => {
    setExpanded((prev) => !prev);
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (label) => {
    setEditLabel(label);
    setEditProxy(proxies[label]);
    setForm(proxies[label]);
    setIsEditing(true);
    setExpanded(true);
  };

  const handleDelete = (label) => {
    setDeleteLabel(label);
    setSessionsUsingProxy([]);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    fetch(`/api/proxies/${deleteLabel}`, { method: 'DELETE' }).then(() => {
      setShowConfirm(false);
      setDeleteLabel(null);
      setSessionsUsingProxy([]);
      if (proxy?.label === deleteLabel && setProxy) {
        setProxy({});
      }
      if (refreshProxies) refreshProxies();
    });
  };

  const handleSave = () => {
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/proxies/${editLabel}` : '/api/proxies';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then(() => {
        setForm({ label: '', host: '', port: '', username: '', password: '' });
        setIsEditing(false);
        setEditLabel('');
        setEditProxy(null);
        if (refreshProxies) refreshProxies();
      });
  };

  const handleAddNew = () => {
    setForm({ label: '', host: '', port: '', username: '', password: '' });
    setIsEditing(false);
    setEditLabel('');
    setEditProxy(null);
    setExpanded(true);
  };

  const handleTestProxy = async (label) => {
    setTestingProxy(label);
    setError(null);
    setSuccess(null);

    // Clear any previous test result for this proxy
    setTestResults((prev) => {
      const updated = { ...prev };
      delete updated[label];
      return updated;
    });

    try {
      const response = await fetch(`/api/proxy_test/${encodeURIComponent(label)}`);
      const data = await response.json();

      if (data.proxied_ip) {
        const statusMsg = 'OK';
        setSuccess(`Proxy tested: ${label} — ${statusMsg}`);
        setTestResults((prev) => ({
          ...prev,
          [label]: { ...data, status: statusMsg },
        }));
      } else {
        setError(`Proxy test failed: ${label} — No IP returned`);
        setTestResults((prev) => ({
          ...prev,
          [label]: { error: 'No IP returned', status: 'Failed' },
        }));
      }
    } catch (_error) {
      setError(`Proxy test failed: ${label}`);
      setTestResults((prev) => ({
        ...prev,
        [label]: { error: 'Test failed', status: 'Failed' },
      }));
    } finally {
      setTestingProxy(null);
    }
  };

  return (
    <>
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            px: 2,
            pt: 2,
            pb: 1.5,
            minHeight: 56,
          }}
          onClick={handleExpand}
        >
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Proxy Configuration
          </Typography>
          <IconButton size="small">
            {expanded ? (
              <ExpandMoreIcon sx={{ transform: 'rotate(180deg)' }} />
            ) : (
              <ExpandMoreIcon />
            )}
          </IconButton>
        </Box>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 0 }}>
            <Box>
              <Box
                component="form"
                onSubmit={(e) => e.preventDefault()}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  width: '100%',
                }}
              >
                <TextField
                  label="Label"
                  name="label"
                  value={form.label}
                  onChange={handleInputChange}
                  disabled={isEditing}
                  required
                  size="small"
                  sx={{ width: 220 }}
                  variant="outlined"
                  InputProps={{ style: { background: 'inherit' } }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Host"
                    name="host"
                    value={form.host}
                    onChange={handleInputChange}
                    required
                    size="small"
                    sx={{ width: 220 }}
                    variant="outlined"
                  />
                  <TextField
                    label="Port"
                    name="port"
                    value={form.port}
                    onChange={handleInputChange}
                    required
                    type="number"
                    size="small"
                    sx={{ width: 120 }}
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Username"
                    name="username"
                    value={form.username}
                    onChange={handleInputChange}
                    size="small"
                    sx={{ width: 220 }}
                    variant="outlined"
                  />
                  <TextField
                    label="Password"
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    type="password"
                    size="small"
                    sx={{ width: 220 }}
                    variant="outlined"
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mt: 2,
                  width: '100%',
                }}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleAddNew}
                  sx={{ minWidth: 100, mr: 2 }}
                >
                  Clear
                </Button>
                <Button variant="contained" onClick={handleSave} sx={{ minWidth: 140 }}>
                  {isEditing ? 'Update Proxy' : 'Save Proxy'}
                </Button>
              </Box>
              {Object.keys(proxies).length > 0 && <Divider sx={{ my: 2 }} />}
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                Configured Proxies
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 1 }}>
                  {success}
                </Alert>
              )}
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {Object.keys(proxies).length === 0 && (
                  <Typography color="text.secondary">No proxies configured.</Typography>
                )}
                {Object.entries(proxies).map(([label, proxy]) => {
                  const testResult = testResults[label];
                  return (
                    <Box
                      key={label}
                      sx={(theme) => ({
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        background: theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5',
                        boxShadow: 0,
                        position: 'relative',
                      })}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 320 }}>
                          Proxy: {label}
                        </Typography>
                        <Box>
                          <Tooltip title="Test Proxy">
                            <IconButton
                              size="small"
                              onClick={() => handleTestProxy(label)}
                              disabled={testingProxy === label}
                            >
                              <NetworkCheckIcon
                                color={
                                  testResult?.error
                                    ? 'error'
                                    : testResult?.proxied_ip
                                      ? 'success'
                                      : 'primary'
                                }
                                fontSize="small"
                              />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Proxy">
                            <IconButton size="small" onClick={() => handleEdit(label)}>
                              <EditIcon color="primary" fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Proxy">
                            <IconButton size="small" onClick={() => handleDelete(label)}>
                              <DeleteIcon color="error" fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ minWidth: 320 }}>
                        Host: {proxy.host}:{proxy.port}
                      </Typography>
                      {proxy.username && (
                        <Typography variant="body2" sx={{ minWidth: 320 }}>
                          Username: {proxy.username}
                        </Typography>
                      )}
                      {testResult && testResult.status && (
                        <Typography
                          variant="body2"
                          sx={(theme) => ({
                            minWidth: 320,
                            fontWeight: 600,
                            color:
                              testResult.status === 'OK'
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                          })}
                        >
                          Status: {testResult.status}
                        </Typography>
                      )}
                      {testResult && !testResult.error && testResult.proxied_ip && (
                        <>
                          <Typography variant="body2" sx={{ minWidth: 320 }}>
                            Proxied IP: {testResult.proxied_ip}
                          </Typography>
                          {testResult.proxied_asn && (
                            <Typography variant="body2" sx={{ minWidth: 320 }}>
                              Proxied ASN: {testResult.proxied_asn}
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                  );
                })}
              </Box>
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
            <b>Warning:</b> Deleting this proxy will immediately remove it from any sessions that
            are using it.
            <br />
            This action cannot be undone.
            <br />
            <br />
            Are you sure you want to delete this proxy?
          </span>
        }
        confirmLabel="Delete"
        confirmColor="error"
      />
    </>
  );
}
