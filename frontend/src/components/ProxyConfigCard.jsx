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
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSession } from '../context/SessionContext.jsx';
import ConfirmDialog from './ConfirmDialog';

export default function ProxyConfigCard({ proxies, refreshProxies }) {
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
    host: '',
    label: '',
    password: '',
    port: '',
    username: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [testingProxy, setTestingProxy] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Fetch sessions on mount. Parent manages `proxies` and will re-render this
  // component if needed; no need to re-run this effect when `proxies` changes.
  useEffect(() => {
    fetch('/api/sessions')
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []));
  }, []);

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
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' },
      method,
    })
      .then((res) => res.json())
      .then(() => {
        setForm({ host: '', label: '', password: '', port: '', username: '' });
        setIsEditing(false);
        setEditLabel('');
        setEditProxy(null);
        if (refreshProxies) refreshProxies();
      });
  };

  const handleAddNew = () => {
    setForm({ host: '', label: '', password: '', port: '', username: '' });
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
      <Card sx={{ borderRadius: 2, boxShadow: 2, mb: 3 }}>
        <Box
          onClick={handleExpand}
          sx={{
            alignItems: 'center',
            cursor: 'pointer',
            display: 'flex',
            minHeight: 56,
            pb: 1.5,
            pt: 2,
            px: 2,
          }}
        >
          <Typography
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexGrow: 1,
              fontWeight: 500,
            }}
            variant="h6"
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
                  disabled={isEditing}
                  InputProps={{ style: { background: 'inherit' } }}
                  label="Label"
                  name="label"
                  onChange={handleInputChange}
                  required
                  size="small"
                  sx={{ width: 220 }}
                  value={form.label}
                  variant="outlined"
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Host"
                    name="host"
                    onChange={handleInputChange}
                    required
                    size="small"
                    sx={{ width: 220 }}
                    value={form.host}
                    variant="outlined"
                  />
                  <TextField
                    label="Port"
                    name="port"
                    onChange={handleInputChange}
                    required
                    size="small"
                    sx={{ width: 120 }}
                    type="number"
                    value={form.port}
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Username"
                    name="username"
                    onChange={handleInputChange}
                    size="small"
                    sx={{ width: 220 }}
                    value={form.username}
                    variant="outlined"
                  />
                  <TextField
                    label="Password"
                    name="password"
                    onChange={handleInputChange}
                    size="small"
                    sx={{ width: 220 }}
                    type="password"
                    value={form.password}
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
                  color="secondary"
                  onClick={handleAddNew}
                  sx={{ minWidth: 100, mr: 2 }}
                  variant="outlined"
                >
                  Clear
                </Button>
                <Button onClick={handleSave} sx={{ minWidth: 140 }} variant="contained">
                  {isEditing ? 'Update Proxy' : 'Save Proxy'}
                </Button>
              </Box>
              {Object.keys(proxies).length > 0 && <Divider sx={{ my: 2 }} />}
              <Typography sx={{ fontWeight: 600, mb: 1, mt: 2 }} variant="subtitle2">
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
                        background: theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5',
                        borderRadius: 2,
                        boxShadow: 0,
                        mb: 2,
                        p: 2,
                        position: 'relative',
                      })}
                    >
                      <Box
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography sx={{ fontWeight: 600, minWidth: 320 }} variant="subtitle2">
                          Proxy: {label}
                        </Typography>
                        <Box>
                          <Tooltip title="Test Proxy">
                            <IconButton
                              disabled={testingProxy === label}
                              onClick={() => handleTestProxy(label)}
                              size="small"
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
                            <IconButton onClick={() => handleEdit(label)} size="small">
                              <EditIcon color="primary" fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Proxy">
                            <IconButton onClick={() => handleDelete(label)} size="small">
                              <DeleteIcon color="error" fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Typography sx={{ minWidth: 320 }} variant="body2">
                        Host: {proxy.host}:{proxy.port}
                      </Typography>
                      {proxy.username && (
                        <Typography sx={{ minWidth: 320 }} variant="body2">
                          Username: {proxy.username}
                        </Typography>
                      )}
                      {testResult?.status && (
                        <Typography
                          sx={(theme) => ({
                            color:
                              testResult.status === 'OK'
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                            fontWeight: 600,
                            minWidth: 320,
                          })}
                          variant="body2"
                        >
                          Status: {testResult.status}
                        </Typography>
                      )}
                      {testResult && !testResult.error && testResult.proxied_ip && (
                        <>
                          <Typography sx={{ minWidth: 320 }} variant="body2">
                            Proxied IP: {testResult.proxied_ip}
                          </Typography>
                          {testResult.proxied_asn && (
                            <Typography sx={{ minWidth: 320 }} variant="body2">
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
        confirmColor="error"
        confirmLabel="Delete"
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
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        open={showConfirm}
        title="Delete Proxy?"
      />
    </>
  );
}
