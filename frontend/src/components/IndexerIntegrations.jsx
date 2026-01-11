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
  Link,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// GitHub icon SVG
const GitHubIcon = ({ size = 16 }) => (
  <svg
    aria-label="GitHub"
    fill="currentColor"
    height={size}
    role="img"
    style={{ display: 'block' }}
    viewBox="0 0 16 16"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

// Discord icon SVG
const DiscordIcon = ({ size = 16 }) => (
  <svg
    aria-label="Discord"
    height={size}
    role="img"
    style={{ display: 'block' }}
    viewBox="0 0 127.14 96.36"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
      fill="#5865F2"
    />
  </svg>
);

export default function IndexerIntegrations({
  prowlarrConfig,
  setProwlarrConfig,
  chaptarrConfig,
  setChaptarrConfig,
  jackettConfig,
  setJackettConfig,
  audiobookrequestConfig,
  setAudiobookrequestConfig,
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

  // AudioBookRequest state
  const [audiobookrequestTestResult, setAudiobookrequestTestResult] = useState(null);
  const [audiobookrequestTestLoading, setAudiobookrequestTestLoading] = useState(false);

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
    if (audiobookrequestTestResult) {
      const timer = setTimeout(() => setAudiobookrequestTestResult(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [audiobookrequestTestResult]);

  useEffect(() => {
    if (updateResult) {
      const timer = setTimeout(() => setUpdateResult(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [updateResult]);

  // Generic handler factory to reduce duplication
  const createChangeHandler = (setter) => (field, value) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const handleProwlarrChange = createChangeHandler(setProwlarrConfig);
  const handleChaptarrChange = createChangeHandler(setChaptarrConfig);
  const handleJackettChange = createChangeHandler(setJackettConfig);
  const handleAudiobookrequestChange = createChangeHandler(setAudiobookrequestConfig);

  // Generic test handler to reduce duplication
  const createTestHandler = (config, endpoint, defaultPort, setLoading, setResult) => async () => {
    if (!config.host || !config.api_key) {
      setResult({ success: false, message: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        host: config.host,
        port: config.port || defaultPort,
        api_key: config.api_key,
      };
      // Add optional admin_password for Jackett
      if (config.admin_password !== undefined) {
        payload.admin_password = config.admin_password || '';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      setResult(result);
    } catch (_error) {
      setResult({ success: false, message: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProwlarrTest = createTestHandler(
    prowlarrConfig,
    '/api/prowlarr/test',
    9696,
    setProwlarrTestLoading,
    setProwlarrTestResult,
  );

  const handleChaptarrTest = createTestHandler(
    chaptarrConfig,
    '/api/chaptarr/test',
    8789,
    setChaptarrTestLoading,
    setChaptarrTestResult,
  );

  const handleJackettTest = createTestHandler(
    jackettConfig,
    '/api/jackett/test',
    9117,
    setJackettTestLoading,
    setJackettTestResult,
  );

  const handleAudiobookrequestTest = createTestHandler(
    audiobookrequestConfig,
    '/api/audiobookrequest/test',
    8000,
    setAudiobookrequestTestLoading,
    setAudiobookrequestTestResult,
  );

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
    prowlarrConfig.enabled ||
    chaptarrConfig.enabled ||
    jackettConfig.enabled ||
    audiobookrequestConfig.enabled;

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
            title="Auto-update your MAM ID in Prowlarr, Chaptarr, Jackett, and/or AudioBookRequest when it changes. You'll be notified before your 90-day MAM session expires so you can update it."
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
            <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
              <Typography sx={{ fontWeight: 600 }} variant="body2">
                Prowlarr
              </Typography>
              <Link
                href="https://github.com/Prowlarr/Prowlarr"
                rel="noopener noreferrer"
                sx={{ alignItems: 'center', display: 'flex' }}
                target="_blank"
              >
                <GitHubIcon size={16} />
              </Link>
            </Box>

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
            <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
              <Typography sx={{ fontWeight: 600 }} variant="body2">
                Chaptarr
              </Typography>
              <Link
                href="https://discord.gg/asJVwT2YpQ"
                rel="noopener noreferrer"
                sx={{ alignItems: 'center', display: 'flex' }}
                target="_blank"
              >
                <DiscordIcon size={16} />
              </Link>
              <Tooltip
                arrow
                placement="right"
                title="If you use Prowlarr to sync MyAnonamouse to Chaptarr, you don't need this integration. However, it's recommended to use MouseTrap for Chaptarr updates instead of Prowlarr."
              >
                <IconButton size="small">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

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
            <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
              <Typography sx={{ fontWeight: 600 }} variant="body2">
                Jackett
              </Typography>
              <Link
                href="https://github.com/Jackett/Jackett"
                rel="noopener noreferrer"
                sx={{ alignItems: 'center', display: 'flex' }}
                target="_blank"
              >
                <GitHubIcon size={16} />
              </Link>
            </Box>

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

          <Divider />

          {/* AudioBookRequest Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
              <Typography sx={{ fontWeight: 600 }} variant="body2">
                AudioBookRequest
              </Typography>
              <Link
                href="https://github.com/markbeep/AudioBookRequest"
                rel="noopener noreferrer"
                sx={{ alignItems: 'center', display: 'flex' }}
                target="_blank"
              >
                <GitHubIcon size={16} />
              </Link>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={audiobookrequestConfig.enabled || false}
                  onChange={(e) => handleAudiobookrequestChange('enabled', e.target.checked)}
                />
              }
              label="Enable AudioBookRequest Integration"
            />

            {audiobookrequestConfig.enabled && (
              <>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    helperText="AudioBookRequest hostname or IP"
                    label="AudioBookRequest Host"
                    onChange={(e) => handleAudiobookrequestChange('host', e.target.value)}
                    placeholder="localhost"
                    required
                    size="small"
                    sx={{ width: 300 }}
                    value={audiobookrequestConfig.host || ''}
                  />
                  <TextField
                    helperText="ABR port"
                    label="Port"
                    onChange={(e) =>
                      handleAudiobookrequestChange(
                        'port',
                        Number.parseInt(e.target.value, 10) || 3000,
                      )
                    }
                    placeholder="3000"
                    required
                    size="small"
                    sx={{ width: 120 }}
                    type="number"
                    value={audiobookrequestConfig.port || 8000}
                  />
                </Box>

                <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: 2 }}>
                  <TextField
                    helperText="ABR API Key (Settings → Account → API Keys)"
                    label="API Key"
                    onChange={(e) => handleAudiobookrequestChange('api_key', e.target.value)}
                    placeholder="Enter API key"
                    required
                    size="small"
                    sx={{ maxWidth: 350 }}
                    type="password"
                    value={audiobookrequestConfig.api_key || ''}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    disabled={
                      audiobookrequestTestLoading ||
                      !audiobookrequestConfig.host ||
                      !audiobookrequestConfig.api_key
                    }
                    onClick={handleAudiobookrequestTest}
                    sx={{ height: 40, minWidth: 150 }}
                    variant="outlined"
                  >
                    {audiobookrequestTestLoading ? 'Testing...' : 'TEST'}
                  </Button>
                </Box>

                {audiobookrequestTestResult && (
                  <Alert
                    severity={audiobookrequestTestResult.success ? 'success' : 'error'}
                    sx={{ mt: -0.5 }}
                  >
                    <Typography variant="body2">{audiobookrequestTestResult.message}</Typography>
                  </Alert>
                )}

                <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                  <TextField
                    label="Notify Before Expiry (days)"
                    onChange={(e) =>
                      handleAudiobookrequestChange(
                        'notify_before_expiry_days',
                        Number.parseInt(e.target.value, 10) || 7,
                      )
                    }
                    size="small"
                    sx={{ width: 220 }}
                    type="number"
                    value={audiobookrequestConfig.notify_before_expiry_days || 7}
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
                      checked={audiobookrequestConfig.auto_update_on_save || false}
                      onChange={(e) =>
                        handleAudiobookrequestChange('auto_update_on_save', e.target.checked)
                      }
                    />
                  }
                  label="Auto-update AudioBookRequest on Save"
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
  audiobookrequestConfig: PropTypes.object.isRequired,
  setAudiobookrequestConfig: PropTypes.func.isRequired,
  mamSessionCreatedDate: PropTypes.string,
  setMamSessionCreatedDate: PropTypes.func.isRequired,
  sessionLabel: PropTypes.string.isRequired,
};
