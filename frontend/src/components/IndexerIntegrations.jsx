import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

export default function IndexerIntegrations({
  prowlarrConfig,
  setProwlarrConfig,
  chaptarrConfig,
  setChaptarrConfig,
  jackettConfig,
  setJackettConfig,
  _mamSessionCreatedDate,
  sessionLabel,
}) {
  const [expanded, setExpanded] = useState(false);

  // Prowlarr state
  const [prowlarrTestResult, setProwlarrTestResult] = useState(null);
  const [prowlarrTestLoading, setProwlarrTestLoading] = useState(false);

  // Chaptarr state
  const [chaptarrTestResult, setChaptarrTestResult] = useState(null);
  const [chaptarrTestLoading, setChaptarrTestLoading] = useState(false);

  // Jackett state
  const [jackettTestResult, setJackettTestResult] = useState(null);
  const [jackettTestLoading, setJackettTestLoading] = useState(false);

  // Unified update state
  const [updateResult, setUpdateResult] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Auto-dismiss alerts
  useEffect(() => {
    if (prowlarrTestResult) {
      const timer = setTimeout(() => setProwlarrTestResult(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [prowlarrTestResult]);

  useEffect(() => {
    if (chaptarrTestResult) {
      const timer = setTimeout(() => setChaptarrTestResult(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [chaptarrTestResult]);

  useEffect(() => {
    if (jackettTestResult) {
      const timer = setTimeout(() => setJackettTestResult(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [jackettTestResult]);

  useEffect(() => {
    if (updateResult) {
      const timer = setTimeout(() => setUpdateResult(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [updateResult]);

  const handleProwlarrChange = (field, value) => {
    setProwlarrConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChaptarrChange = (field, value) => {
    setChaptarrConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleJackettChange = (field, value) => {
    setJackettConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProwlarrTest = async () => {
    if (!prowlarrConfig.host || !prowlarrConfig.api_key) {
      setProwlarrTestResult({ success: false, message: 'Please fill in all required fields' });
      return;
    }

    setProwlarrTestLoading(true);
    try {
      const response = await fetch('/api/prowlarr/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: prowlarrConfig.host,
          port: prowlarrConfig.port || 9696,
          api_key: prowlarrConfig.api_key,
        }),
      });

      const result = await response.json();
      setProwlarrTestResult(result);
    } catch (_error) {
      setProwlarrTestResult({ success: false, message: 'Network error' });
    } finally {
      setProwlarrTestLoading(false);
    }
  };

  const handleChaptarrTest = async () => {
    if (!chaptarrConfig.host || !chaptarrConfig.api_key) {
      setChaptarrTestResult({ success: false, message: 'Please fill in all required fields' });
      return;
    }

    setChaptarrTestLoading(true);
    try {
      const response = await fetch('/api/chaptarr/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: chaptarrConfig.host,
          port: chaptarrConfig.port || 8789,
          api_key: chaptarrConfig.api_key,
        }),
      });

      const result = await response.json();
      setChaptarrTestResult(result);
    } catch (_error) {
      setChaptarrTestResult({ success: false, message: 'Network error' });
    } finally {
      setChaptarrTestLoading(false);
    }
  };

  const handleJackettTest = async () => {
    if (!jackettConfig.host || !jackettConfig.api_key) {
      setJackettTestResult({ success: false, message: 'Please fill in host and API key' });
      return;
    }

    setJackettTestLoading(true);
    try {
      const response = await fetch('/api/jackett/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: jackettConfig.host,
          port: jackettConfig.port || 9117,
          api_key: jackettConfig.api_key,
          admin_password: jackettConfig.admin_password || '',
        }),
      });

      const result = await response.json();
      setJackettTestResult(result);
    } catch (_error) {
      setJackettTestResult({ success: false, message: 'Network error' });
    } finally {
      setJackettTestLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdateLoading(true);
    try {
      // Use the unified endpoint that updates both services
      const response = await fetch('/api/indexer/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: sessionLabel,
        }),
      });

      const result = await response.json();

      // Handle detailed error messages
      if (!result.success && result.detail) {
        setUpdateResult({
          success: false,
          message: result.detail || result.message || 'Update failed',
        });
      } else {
        setUpdateResult(result);
      }
    } catch (error) {
      setUpdateResult({ success: false, message: `Network error: ${error.message}` });
    } finally {
      setUpdateLoading(false);
    }
  };

  const anyServiceEnabled =
    prowlarrConfig.enabled || chaptarrConfig.enabled || jackettConfig.enabled;

  return (
    <Accordion
      expanded={expanded}
      onChange={(_e, isExpanded) => setExpanded(isExpanded)}
      sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5'),
        borderRadius: 2,
        mb: 3,
        overflow: 'hidden',
      }}
    >
      <AccordionSummary
        aria-controls="indexer-content"
        expandIcon={<ExpandMoreIcon />}
        id="indexer-header"
        sx={{
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5'),
        }}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
          <Typography sx={{ fontWeight: 600 }} variant="subtitle2">
            Indexer Integrations
          </Typography>
          <Tooltip
            placement="right"
            title="Auto-update your MAM ID in Prowlarr, Chaptarr, and/or Jackett when it changes. You'll be notified before your 90-day MAM session expires so you can update it."
          >
            <IconButton size="small">
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5'),
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Prowlarr Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography sx={{ fontWeight: 600 }} variant="body2">
              Prowlarr
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={prowlarrConfig.enabled || false}
                  onChange={(e) => handleProwlarrChange('enabled', e.target.checked)}
                />
              }
              label="Enable Prowlarr Integration"
            />

            {prowlarrConfig.enabled && (
              <>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    helperText="Prowlarr hostname or IP"
                    label="Prowlarr Host"
                    onChange={(e) => handleProwlarrChange('host', e.target.value)}
                    placeholder="localhost"
                    required
                    size="small"
                    sx={{ width: 300 }}
                    value={prowlarrConfig.host || ''}
                  />
                  <TextField
                    helperText="Prowlarr port"
                    label="Port"
                    onChange={(e) =>
                      handleProwlarrChange('port', Number.parseInt(e.target.value, 10) || 9696)
                    }
                    placeholder="9696"
                    required
                    size="small"
                    sx={{ width: 120 }}
                    type="number"
                    value={prowlarrConfig.port || 9696}
                  />
                </Box>

                <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: 2 }}>
                  <TextField
                    helperText="Prowlarr API Key (Settings → General → Security)"
                    label="API Key"
                    onChange={(e) => handleProwlarrChange('api_key', e.target.value)}
                    placeholder="Enter API key"
                    required
                    size="small"
                    sx={{ flex: 1, maxWidth: 350 }}
                    type="password"
                    value={prowlarrConfig.api_key || ''}
                  />
                  <Button
                    disabled={
                      prowlarrTestLoading || !prowlarrConfig.host || !prowlarrConfig.api_key
                    }
                    onClick={handleProwlarrTest}
                    sx={{ height: 40, minWidth: 150 }}
                    variant="outlined"
                  >
                    {prowlarrTestLoading ? 'Testing...' : 'TEST'}
                  </Button>
                </Box>

                {prowlarrTestResult && (
                  <Alert
                    severity={prowlarrTestResult.success ? 'success' : 'error'}
                    sx={{ mt: -0.5 }}
                  >
                    {prowlarrTestResult.success ? (
                      <Typography variant="body2">
                        Connection successful! MyAnonamouse indexer found with ID:{' '}
                        {prowlarrTestResult.indexer_id || 'N/A'}
                      </Typography>
                    ) : (
                      <Typography variant="body2">{prowlarrTestResult.message}</Typography>
                    )}
                  </Alert>
                )}

                <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                  <TextField
                    label="Notify Before Expiry (days)"
                    onChange={(e) =>
                      handleProwlarrChange(
                        'notify_before_expiry_days',
                        Number.parseInt(e.target.value, 10) || 7,
                      )
                    }
                    size="small"
                    sx={{ width: 220 }}
                    type="number"
                    value={prowlarrConfig.notify_before_expiry_days || 7}
                  />
                  <Tooltip
                    arrow
                    placement="right"
                    title="Number of days before expiry to send notification"
                  >
                    <IconButton size="small">
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={prowlarrConfig.auto_update_on_save || false}
                      onChange={(e) =>
                        handleProwlarrChange('auto_update_on_save', e.target.checked)
                      }
                    />
                  }
                  label="Auto-update Prowlarr on Save"
                />
              </>
            )}
          </Box>

          <Divider />

          {/* Chaptarr Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography sx={{ fontWeight: 600 }} variant="body2">
              Chaptarr
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={chaptarrConfig.enabled || false}
                  onChange={(e) => handleChaptarrChange('enabled', e.target.checked)}
                />
              }
              label="Enable Chaptarr Integration"
            />

            {chaptarrConfig.enabled && (
              <>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    helperText="Chaptarr hostname or IP"
                    label="Chaptarr Host"
                    onChange={(e) => handleChaptarrChange('host', e.target.value)}
                    placeholder="localhost"
                    required
                    size="small"
                    sx={{ width: 300 }}
                    value={chaptarrConfig.host || ''}
                  />
                  <TextField
                    helperText="Chaptarr port"
                    label="Port"
                    onChange={(e) =>
                      handleChaptarrChange('port', Number.parseInt(e.target.value, 10) || 8789)
                    }
                    placeholder="8789"
                    required
                    size="small"
                    sx={{ width: 120 }}
                    type="number"
                    value={chaptarrConfig.port || 8789}
                  />
                </Box>

                <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: 2 }}>
                  <TextField
                    helperText="Chaptarr API Key (Settings → General → Security)"
                    label="API Key"
                    onChange={(e) => handleChaptarrChange('api_key', e.target.value)}
                    placeholder="Enter API key"
                    required
                    size="small"
                    sx={{ flex: 1, maxWidth: 350 }}
                    type="password"
                    value={chaptarrConfig.api_key || ''}
                  />
                  <Button
                    disabled={
                      chaptarrTestLoading || !chaptarrConfig.host || !chaptarrConfig.api_key
                    }
                    onClick={handleChaptarrTest}
                    sx={{ height: 40, minWidth: 150 }}
                    variant="outlined"
                  >
                    {chaptarrTestLoading ? 'Testing...' : 'TEST'}
                  </Button>
                </Box>

                {chaptarrTestResult && (
                  <Alert
                    severity={chaptarrTestResult.success ? 'success' : 'error'}
                    sx={{ mt: -0.5 }}
                  >
                    {chaptarrTestResult.success ? (
                      <Typography variant="body2">
                        Connection successful! MyAnonaMouse indexer found with ID:{' '}
                        {chaptarrTestResult.indexer_id || 'N/A'}
                      </Typography>
                    ) : (
                      <Typography variant="body2">{chaptarrTestResult.message}</Typography>
                    )}
                  </Alert>
                )}

                <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                  <TextField
                    label="Notify Before Expiry (days)"
                    onChange={(e) =>
                      handleChaptarrChange(
                        'notify_before_expiry_days',
                        Number.parseInt(e.target.value, 10) || 7,
                      )
                    }
                    size="small"
                    sx={{ width: 220 }}
                    type="number"
                    value={chaptarrConfig.notify_before_expiry_days || 7}
                  />
                  <Tooltip
                    arrow
                    placement="right"
                    title="Number of days before expiry to send notification"
                  >
                    <IconButton size="small">
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={chaptarrConfig.auto_update_on_save || false}
                      onChange={(e) =>
                        handleChaptarrChange('auto_update_on_save', e.target.checked)
                      }
                    />
                  }
                  label="Auto-update Chaptarr on Save"
                />
              </>
            )}
          </Box>

          <Divider />

          {/* Jackett Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography sx={{ fontWeight: 600 }} variant="body2">
              Jackett
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={jackettConfig.enabled || false}
                  onChange={(e) => handleJackettChange('enabled', e.target.checked)}
                />
              }
              label="Enable Jackett Integration"
            />

            {jackettConfig.enabled && (
              <>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    helperText="Jackett hostname or IP"
                    label="Jackett Host"
                    onChange={(e) => handleJackettChange('host', e.target.value)}
                    placeholder="localhost"
                    required
                    size="small"
                    sx={{ width: 300 }}
                    value={jackettConfig.host || ''}
                  />
                  <TextField
                    helperText="Jackett port"
                    label="Port"
                    onChange={(e) =>
                      handleJackettChange('port', Number.parseInt(e.target.value, 10) || 9117)
                    }
                    placeholder="9117"
                    required
                    size="small"
                    sx={{ width: 120 }}
                    type="number"
                    value={jackettConfig.port || 9117}
                  />
                </Box>

                <Box
                  sx={{
                    alignItems: 'flex-start',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <TextField
                    helperText="Jackett API Key (found at top of Dashboard page)"
                    label="API Key"
                    onChange={(e) => handleJackettChange('api_key', e.target.value)}
                    placeholder="Enter API key"
                    required
                    size="small"
                    sx={{ maxWidth: 350 }}
                    type="password"
                    value={jackettConfig.api_key || ''}
                  />
                  <TextField
                    helperText="Jackett admin password (optional, only needed if authentication is enabled in Jackett)"
                    label="Admin Password (Optional)"
                    onChange={(e) => handleJackettChange('admin_password', e.target.value)}
                    placeholder="Leave empty if Jackett auth is disabled"
                    required
                    size="small"
                    sx={{ maxWidth: 350 }}
                    type="password"
                    value={jackettConfig.admin_password || ''}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    disabled={jackettTestLoading || !jackettConfig.host || !jackettConfig.api_key}
                    onClick={handleJackettTest}
                    sx={{ height: 40, minWidth: 150 }}
                    variant="outlined"
                  >
                    {jackettTestLoading ? 'Testing...' : 'TEST'}
                  </Button>
                </Box>

                {jackettTestResult && (
                  <Alert
                    severity={jackettTestResult.success ? 'success' : 'error'}
                    sx={{ mt: -0.5 }}
                  >
                    <Typography variant="body2">{jackettTestResult.message}</Typography>
                  </Alert>
                )}

                <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                  <TextField
                    label="Notify Before Expiry (days)"
                    onChange={(e) =>
                      handleJackettChange(
                        'notify_before_expiry_days',
                        Number.parseInt(e.target.value, 10) || 7,
                      )
                    }
                    size="small"
                    sx={{ width: 220 }}
                    type="number"
                    value={jackettConfig.notify_before_expiry_days || 7}
                  />
                  <Tooltip
                    arrow
                    placement="right"
                    title="Number of days before expiry to send notification"
                  >
                    <IconButton size="small">
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={jackettConfig.auto_update_on_save || false}
                      onChange={(e) => handleJackettChange('auto_update_on_save', e.target.checked)}
                    />
                  }
                  label="Auto-update Jackett on Save"
                />
              </>
            )}
          </Box>

          {/* Unified Update Button */}
          {anyServiceEnabled && (
            <>
              <Divider />
              <Box
                sx={{ alignItems: 'center', display: 'flex', gap: 1, justifyContent: 'flex-end' }}
              >
                <Tooltip
                  arrow
                  placement="top"
                  title="Clicking this button will push the current MAM ID in MouseTrap to Prowlarr, Chaptarr, and/or Jackett, depending on your configuration"
                >
                  <Button disabled={updateLoading} onClick={handleUpdate} variant="contained">
                    {updateLoading ? 'Updating...' : 'UPDATE'}
                  </Button>
                </Tooltip>
              </Box>

              {updateResult && (
                <Alert
                  severity={
                    updateResult.success ? (updateResult.warning ? 'warning' : 'success') : 'error'
                  }
                >
                  <Typography variant="body2">{updateResult.message}</Typography>
                </Alert>
              )}
            </>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

IndexerIntegrations.propTypes = {
  prowlarrConfig: PropTypes.object.isRequired,
  setProwlarrConfig: PropTypes.func.isRequired,
  chaptarrConfig: PropTypes.object.isRequired,
  setChaptarrConfig: PropTypes.func.isRequired,
  jackettConfig: PropTypes.object.isRequired,
  setJackettConfig: PropTypes.func.isRequired,
  mamSessionCreatedDate: PropTypes.string,
  setMamSessionCreatedDate: PropTypes.func.isRequired,
  sessionLabel: PropTypes.string.isRequired,
};
