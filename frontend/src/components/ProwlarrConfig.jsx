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
  FormControlLabel,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

export default function ProwlarrConfig({
  prowlarrConfig,
  setProwlarrConfig,
  _mamSessionCreatedDate,
  setMamSessionCreatedDate,
  sessionLabel,
}) {
  const [expanded, setExpanded] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [updateResult, setUpdateResult] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Auto-dismiss alerts
  useEffect(() => {
    if (testResult) {
      const timer = setTimeout(() => setTestResult(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [testResult]);

  useEffect(() => {
    if (updateResult) {
      const timer = setTimeout(() => setUpdateResult(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [updateResult]);

  const handleChange = (field, value) => {
    setProwlarrConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTest = async () => {
    if (!prowlarrConfig.host || !prowlarrConfig.api_key) {
      setTestResult({ success: false, message: 'Please fill in all required fields' });
      return;
    }

    setTestLoading(true);
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
      setTestResult(result);
    } catch (_error) {
      setTestResult({ success: false, message: 'Network error' });
    } finally {
      setTestLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdateLoading(true);
    try {
      const response = await fetch('/api/prowlarr/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: sessionLabel,
        }),
      });

      const result = await response.json();

      // Handle detailed error messages from Prowlarr
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

  const _fetchServerTime = async () => {
    try {
      const response = await fetch('/api/server_time');
      const data = await response.json();
      // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:MM)
      const dateTimeLocal = data.server_time.substring(0, 16);
      setMamSessionCreatedDate(dateTimeLocal);
    } catch (error) {
      console.error('Failed to fetch server time:', error);
    }
  };

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
        aria-controls="prowlarr-content"
        expandIcon={<ExpandMoreIcon />}
        id="prowlarr-header"
        sx={{
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5'),
        }}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
          <Typography sx={{ fontWeight: 600 }} variant="subtitle2">
            Prowlarr Integration
          </Typography>
          <Tooltip
            placement="right"
            title="Auto-update your MAM ID in Prowlarr when it changes. You'll be notified before your 90-day MAM session expires so you can update it."
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={prowlarrConfig.enabled || false}
                onChange={(e) => handleChange('enabled', e.target.checked)}
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
                  onChange={(e) => handleChange('host', e.target.value)}
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
                    handleChange('port', Number.parseInt(e.target.value, 10) || 9696)
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
                  onChange={(e) => handleChange('api_key', e.target.value)}
                  placeholder="Enter API key"
                  required
                  size="small"
                  sx={{ flex: 1, maxWidth: 350 }}
                  type="password"
                  value={prowlarrConfig.api_key || ''}
                />
                <Button
                  disabled={testLoading || !prowlarrConfig.host || !prowlarrConfig.api_key}
                  onClick={handleTest}
                  sx={{ height: 40, minWidth: 150 }}
                  variant="outlined"
                >
                  {testLoading ? 'Testing...' : 'TEST PROWLARR'}
                </Button>
              </Box>

              {testResult && (
                <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mt: -0.5 }}>
                  {testResult.success ? (
                    <Typography variant="body2">
                      Connection successful! MyAnonamouse indexer found with ID:{' '}
                      {testResult.indexer_id || 'N/A'}
                    </Typography>
                  ) : (
                    <Typography variant="body2">{testResult.message}</Typography>
                  )}
                </Alert>
              )}

              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                  <TextField
                    label="Notify Before Expiry (days)"
                    onChange={(e) =>
                      handleChange(
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
                <Button disabled={updateLoading} onClick={handleUpdate} variant="contained">
                  {updateLoading ? 'Updating...' : 'UPDATE PROWLARR'}
                </Button>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={prowlarrConfig.auto_update_on_save || false}
                    onChange={(e) => handleChange('auto_update_on_save', e.target.checked)}
                  />
                }
                label="Auto-update Prowlarr on Save"
              />

              {updateResult && (
                <Alert severity={updateResult.success ? 'success' : 'error'}>
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

ProwlarrConfig.propTypes = {
  prowlarrConfig: PropTypes.object.isRequired,
  setProwlarrConfig: PropTypes.func.isRequired,
  mamSessionCreatedDate: PropTypes.string,
  setMamSessionCreatedDate: PropTypes.func.isRequired,
  sessionLabel: PropTypes.string.isRequired,
};
