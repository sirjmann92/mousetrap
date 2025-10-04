import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import FeedbackSnackbar from './FeedbackSnackbar';

export default function MAMBrowserSetupCard({
  proxies,
  sessions,
  vaultConfigurations,
  onConfigUpdate,
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [currentConfig, setCurrentConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBrowserMamId, setShowBrowserMamId] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [bookmarkletOpen, setBookmarkletOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [workingConfigName, setWorkingConfigName] = useState('');
  const [snackbar, setSnackbar] = useState({
    message: '',
    open: false,
    severity: 'success',
  });

  // Bookmarklet code - extract both mam_id and uid cookies from browser
  const bookmarkletCode = `javascript:(function(){try{if(!window.location.href.includes('myanonamouse.net')){alert('Please use this bookmarklet on MyAnonamouse.net');return;}var cookies=document.cookie.split(';');var mamId=null;var uid=null;for(var i=0;i<cookies.length;i++){var cookie=cookies[i].trim();if(cookie.startsWith('mam_id=')){mamId=cookie.substring(7);}else if(cookie.startsWith('uid=')){uid=cookie.substring(4);}}if(mamId&&uid){var browser='unknown';var ua=navigator.userAgent;if(ua.includes('Firefox')){browser='firefox';}else if(ua.includes('Chrome')&&!ua.includes('Edg')){browser='chrome';}else if(ua.includes('Edg')){browser='edge';}else if(ua.includes('Safari')&&!ua.includes('Chrome')){browser='safari';}else if(ua.includes('Opera')||ua.includes('OPR')){browser='opera';}var cookieString='mam_id='+mamId+'; uid='+uid+'; browser='+browser;if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(cookieString).then(function(){alert('Browser MAM ID copied to clipboard!\\n\\nThis includes both mam_id and uid cookies, plus browser type ('+browser+') for proper headers.');}).catch(function(){prompt('Browser MAM ID (copy this):',cookieString);});}else{prompt('Browser MAM ID (copy this):',cookieString);}}else{var missing=[];if(!mamId)missing.push('mam_id');if(!uid)missing.push('uid');alert('Missing required cookies: '+missing.join(', ')+'\\n\\nMake sure you are logged in to MyAnonamouse and try again.');}}catch(e){alert('Bookmarklet error: '+e.message);console.error('MAM Cookie Extractor Error:',e);}})();`;

  // Callback ref to set href immediately when element is created (bypasses React 19 security)
  const bookmarkletRef = useCallback((node) => {
    if (node) {
      node.href = bookmarkletCode;
    }
  }, []);

  // Auto-select configuration if there's only one
  useEffect(() => {
    const configKeys = Object.keys(vaultConfigurations || {});
    if (configKeys.length === 1 && !selectedConfigId) {
      setSelectedConfigId(configKeys[0]);
    }
  }, [vaultConfigurations, selectedConfigId]);

  // Load selected configuration from API (not from list, to get full data)
  useEffect(() => {
    const loadConfig = async () => {
      if (selectedConfigId && !isCreatingNew) {
        try {
          const response = await fetch(`/api/vault/configuration/${selectedConfigId}`);
          if (response.ok) {
            const data = await response.json();
            setCurrentConfig(data);
          }
        } catch (error) {
          console.error('Error loading configuration:', error);
        }
      } else if (!selectedConfigId) {
        setCurrentConfig(null);
      }
    };
    loadConfig();
  }, [selectedConfigId, isCreatingNew]);

  const handleCreateConfiguration = async () => {
    // Generate a unique default name
    const base = 'Configuration';
    let idx = 1;
    let configId = base + idx;

    // Find unique name
    while (vaultConfigurations[configId]) {
      idx++;
      configId = base + idx;
    }

    try {
      setIsLoading(true);

      // Get the default configuration template
      const defaultResponse = await fetch(`/api/vault/configuration/${configId}/default`);
      if (!defaultResponse.ok) {
        throw new Error('Failed to get default configuration');
      }
      const defaultConfig = await defaultResponse.json();

      // Enter "create new" mode
      setIsCreatingNew(true);
      setSelectedConfigId(configId);
      setWorkingConfigName(configId);
      setCurrentConfig(defaultConfig);
      setExpanded(true);
    } catch (error) {
      console.error('Error creating configuration:', error);
      setSnackbar({
        message: 'Error creating configuration',
        open: true,
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedConfigId || isCreatingNew) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/vault/configuration/${selectedConfigId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSnackbar({
          message: 'Configuration deleted successfully!',
          open: true,
          severity: 'success',
        });
        setDeleteDialogOpen(false);
        if (onConfigUpdate) {
          onConfigUpdate();
        }
        setSelectedConfigId('');
        setCurrentConfig(null);
      } else {
        const data = await response.json();
        setSnackbar({
          message: data.detail || data.error || 'Error deleting configuration',
          open: true,
          severity: 'error',
        });
      }
    } catch (_error) {
      setSnackbar({
        message: 'Error deleting configuration',
        open: true,
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    // Use working name for new configs, or selected ID for existing
    const configIdToSave = isCreatingNew ? workingConfigName : selectedConfigId;

    if (!configIdToSave || !currentConfig) {
      setSnackbar({
        message: 'Configuration name is required',
        open: true,
        severity: 'error',
      });
      return;
    }

    // Basic validation
    if (!currentConfig.browser_mam_id) {
      setSnackbar({
        message: 'Browser MAM ID is required',
        open: true,
        severity: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/vault/configuration/${configIdToSave}`, {
        body: JSON.stringify(currentConfig),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSnackbar({
          message: 'Browser setup saved successfully!',
          open: true,
          severity: 'success',
        });

        // Exit create mode and switch to saved config
        if (isCreatingNew) {
          setIsCreatingNew(false);
          setSelectedConfigId(configIdToSave);
        }

        // Notify parent to refresh configurations
        if (onConfigUpdate) {
          onConfigUpdate();
        }
      } else {
        const errorMessage = data.errors
          ? data.errors.join(', ')
          : data.detail || data.error || 'Failed to save configuration';
        setSnackbar({ message: errorMessage, open: true, severity: 'error' });
      }
    } catch (_error) {
      setSnackbar({
        message: 'Error saving configuration',
        open: true,
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateConfiguration = async () => {
    if (!currentConfig || !selectedConfigId) {
      setSnackbar({
        message: 'No configuration selected',
        open: true,
        severity: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);
      setValidationResult(null);

      const response = await fetch(`/api/vault/configuration/${selectedConfigId}/validate`, {
        body: JSON.stringify(currentConfig),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const data = await response.json();
      console.log('[VaultValidation] Response data:', data);
      setValidationResult(data);

      if (data.config_valid && data.vault_accessible) {
        setSnackbar({
          message: 'Vault access validated successfully!',
          open: true,
          severity: 'success',
        });
        setTimeout(() => setValidationResult(null), 5000);
      } else {
        const errorMsg =
          data.errors?.join(', ') || data.detail || data.error || 'Validation failed';
        console.error('[VaultValidation] Validation failed:', data);
        setSnackbar({ message: errorMsg, open: true, severity: 'error' });
        setTimeout(() => setValidationResult(null), 7000);
      }
    } catch (_error) {
      setValidationResult({
        config_valid: false,
        error: 'Network error or server unavailable',
        vault_accessible: false,
      });
      setSnackbar({
        message: 'Error validating configuration',
        open: true,
        severity: 'error',
      });
      setTimeout(() => setValidationResult(null), 7000);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBookmarklet = () => {
    setBookmarkletOpen(true);
  };

  return (
    <>
      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <Box
          onClick={() => setExpanded((e) => !e)}
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
          <Typography sx={{ flexGrow: 1 }} variant="h6">
            Browser Cookie Setup
          </Typography>
          <IconButton size="small">{expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
        </Box>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 0 }}>
            <Box sx={{ height: 7 }} />

            {/* Configuration Selector with CRUD controls */}
            <Box sx={{ alignItems: 'center', display: 'flex', mb: currentConfig ? 3 : 1 }}>
              <FormControl size="small" sx={{ maxWidth: 300, minWidth: 200 }}>
                <InputLabel>Configuration</InputLabel>
                <Select
                  disabled={isCreatingNew}
                  label="Configuration"
                  MenuProps={{ disableScrollLock: true }}
                  onChange={(e) => {
                    if (!isCreatingNew) {
                      setSelectedConfigId(e.target.value);
                    }
                  }}
                  value={selectedConfigId || ''}
                >
                  {Object.keys(vaultConfigurations || {}).map((configId) => (
                    <MenuItem key={configId} value={configId}>
                      {configId}
                    </MenuItem>
                  ))}
                  {isCreatingNew && (
                    <MenuItem key={selectedConfigId} value={selectedConfigId}>
                      {selectedConfigId} (new)
                    </MenuItem>
                  )}
                </Select>
              </FormControl>

              <Tooltip title="Create New Configuration">
                <IconButton
                  color="success"
                  disabled={isCreatingNew}
                  onClick={handleCreateConfiguration}
                  sx={{ ml: 1 }}
                >
                  <AddCircleOutlineIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete Configuration">
                <span>
                  <IconButton
                    color="error"
                    disabled={!selectedConfigId || isCreatingNew}
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            {currentConfig && (
              <>
                {/* Configuration Name field when creating new */}
                {isCreatingNew && (
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      error={isCreatingNew && !workingConfigName}
                      helperText={isCreatingNew ? 'Required for new configurations' : ''}
                      label="Configuration Name"
                      onChange={(e) => {
                        setWorkingConfigName(e.target.value);
                        setSelectedConfigId(e.target.value);
                      }}
                      required
                      size="small"
                      sx={{ width: 300 }}
                      value={workingConfigName}
                    />
                  </Box>
                )}

                {/* Associated Session */}
                <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, mb: 3 }}>
                  <FormControl size="small" sx={{ width: 300 }}>
                    <InputLabel>Associated Session</InputLabel>
                    <Select
                      label="Associated Session"
                      MenuProps={{ disableScrollLock: true }}
                      onChange={(e) =>
                        setCurrentConfig({
                          ...currentConfig,
                          associated_session_label: e.target.value,
                        })
                      }
                      value={currentConfig.associated_session_label || ''}
                    >
                      <MenuItem value="">
                        <em>No session association</em>
                      </MenuItem>
                      {(sessions || []).map((sessionLabel) => (
                        <MenuItem key={sessionLabel} value={sessionLabel}>
                          {sessionLabel}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Tooltip
                    placement="right"
                    title="Associated session is required for vault automation and notifications. Without it, you can still perform manual donations but won't receive automated behavior."
                  >
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Browser MAM ID - simplified for cookie extraction */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    error={!currentConfig.browser_mam_id}
                    helperText={
                      !currentConfig.browser_mam_id
                        ? 'Browser MAM ID is required'
                        : 'Required browser cookies for vault access'
                    }
                    label="Browser MAM ID + UID"
                    maxRows={showBrowserMamId ? 6 : 2}
                    minRows={showBrowserMamId ? 6 : 2}
                    multiline
                    onChange={(e) =>
                      setCurrentConfig({
                        ...currentConfig,
                        browser_mam_id: e.target.value,
                      })
                    }
                    placeholder="mam_id=...; uid=..."
                    required
                    size="small"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={
                                showBrowserMamId ? 'Hide Browser MAM ID' : 'Show Browser MAM ID'
                              }
                              edge="end"
                              onClick={() => setShowBrowserMamId((v) => !v)}
                            >
                              {showBrowserMamId ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                      htmlInput: {
                        maxLength: 1000,
                        style: showBrowserMamId ? {} : { WebkitTextSecurity: 'disc' },
                      },
                    }}
                    sx={{ width: { md: 450, sm: 400, xs: '100%' } }}
                    value={currentConfig.browser_mam_id || ''}
                  />
                </Box>

                {/* Connection Method - required field */}
                <Box sx={{ mb: 2 }}>
                  <FormControl required size="small" sx={{ width: 300 }}>
                    <InputLabel>Connection Method</InputLabel>
                    <Select
                      label="Connection Method"
                      MenuProps={{ disableScrollLock: true }}
                      onChange={(e) =>
                        setCurrentConfig({
                          ...currentConfig,
                          connection_method: e.target.value,
                        })
                      }
                      required
                      value={currentConfig.connection_method || 'direct'}
                    >
                      <MenuItem value="direct">Direct (Browser Connection)</MenuItem>
                      <MenuItem value="proxy">Via Proxy</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Vault Proxy - only show if proxy method selected */}
                {currentConfig.connection_method === 'proxy' && (
                  <Box sx={{ mb: 2 }}>
                    <FormControl size="small" sx={{ width: 200 }}>
                      <InputLabel>Vault Proxy</InputLabel>
                      <Select
                        label="Vault Proxy"
                        MenuProps={{ disableScrollLock: true }}
                        onChange={(e) =>
                          setCurrentConfig({
                            ...currentConfig,
                            vault_proxy_label: e.target.value,
                          })
                        }
                        value={currentConfig.vault_proxy_label || ''}
                      >
                        <MenuItem value="">No Proxy</MenuItem>
                        {Object.keys(proxies || {}).map((proxyLabel) => (
                          <MenuItem key={proxyLabel} value={proxyLabel}>
                            {proxyLabel}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {/* Action buttons */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    justifyContent: 'space-between',
                    mt: 2,
                  }}
                >
                  {/* Left side buttons */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      disabled={isLoading}
                      onClick={generateBookmarklet}
                      sx={{ height: 40, minWidth: 140 }}
                      variant="outlined"
                    >
                      Get Browser Cookies
                    </Button>
                    <Button
                      disabled={isLoading || !currentConfig.browser_mam_id}
                      onClick={handleValidateConfiguration}
                      sx={{ height: 40, minWidth: 140 }}
                      variant="outlined"
                    >
                      Test Vault Access
                    </Button>
                  </Box>
                </Box>

                {/* Validation Result */}
                {validationResult && (
                  <Box sx={{ mt: 2 }}>
                    <Alert
                      severity={
                        validationResult.config_valid && validationResult.vault_accessible
                          ? 'success'
                          : 'error'
                      }
                    >
                      {validationResult.config_valid && validationResult.vault_accessible ? (
                        <>
                          <Typography variant="body2">
                            <b>✓ Configuration Valid</b>
                          </Typography>
                          <Typography variant="body2">
                            <b>✓ Vault Accessible</b>
                          </Typography>
                          {validationResult.vault_total !== undefined && (
                            <Typography variant="body2">
                              Vault Total: <b>{validationResult.vault_total.toLocaleString()}</b>{' '}
                              points
                            </Typography>
                          )}
                        </>
                      ) : (
                        <>
                          {!validationResult.config_valid && (
                            <Typography variant="body2">
                              <b>✗ Configuration Invalid</b>
                            </Typography>
                          )}
                          {!validationResult.vault_accessible && (
                            <Typography variant="body2">
                              <b>✗ Vault Not Accessible</b>
                            </Typography>
                          )}
                          {validationResult.errors && validationResult.errors.length > 0 && (
                            <Typography variant="body2">
                              Errors: {validationResult.errors.join(', ')}
                            </Typography>
                          )}
                        </>
                      )}
                    </Alert>
                  </Box>
                )}

                {/* Save Button at the bottom */}
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  {isCreatingNew && (
                    <Button
                      disabled={isLoading}
                      onClick={() => {
                        setIsCreatingNew(false);
                        setSelectedConfigId('');
                        setCurrentConfig(null);
                        setWorkingConfigName('');
                      }}
                      sx={{ minWidth: 100 }}
                      variant="outlined"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    disabled={isLoading}
                    onClick={handleSaveConfiguration}
                    sx={{ minWidth: 180 }}
                    variant="contained"
                  >
                    {isCreatingNew ? 'Save Configuration' : 'Save Changes'}
                  </Button>
                </Box>
              </>
            )}

            {!currentConfig && (
              <Typography color="text.secondary" variant="body2">
                Select a vault configuration to manage browser cookie setup.
              </Typography>
            )}
          </CardContent>
        </Collapse>
      </Card>

      {/* Bookmarklet dialog */}
      <Dialog
        disableScrollLock
        fullWidth
        maxWidth="lg"
        onClose={() => setBookmarkletOpen(false)}
        open={bookmarkletOpen}
      >
        <DialogTitle>Get Browser Cookies for Vault Access</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }} variant="body2">
            1. Drag the button below to your bookmarks bar (or right-click → "Bookmark Link" in
            Firefox)
            <br />
            2. Go to MyAnonamouse.net in your browser and log in
            <br />
            3. Click the bookmarklet to extract both your <strong>mam_id</strong> and{' '}
            <strong>uid</strong> cookies
            <br />
            4. The cookies will be automatically copied to your clipboard
          </Typography>

          <Typography
            sx={{
              bgcolor: 'success.light',
              borderRadius: 1,
              color: 'success.contrastText',
              mb: 2,
              p: 1,
            }}
            variant="body2"
          >
            ✨ <strong>New:</strong> This bookmarklet extracts everything needed for vault access in
            one click! No need for session association or manual configuration.
          </Typography>

          <Typography
            sx={{
              bgcolor: 'info.light',
              borderRadius: 1,
              color: 'info.contrastText',
              mb: 2,
              p: 1,
            }}
            variant="body2"
          >
            💡 <strong>Tip:</strong> If you don't see your bookmarks bar, press{' '}
            <kbd>Ctrl+Shift+B</kbd> (Windows/Linux) or <kbd>Cmd+Shift+B</kbd> (Mac) to show it.
          </Typography>

          <Typography
            sx={{
              bgcolor: 'warning.light',
              borderRadius: 1,
              color: 'warning.contrastText',
              mb: 2,
              p: 1,
            }}
            variant="body2"
          >
            🦊 <strong>Firefox Users:</strong> Dragging may not work due to security restrictions.
            Instead, <strong>right-click</strong> the button below and select "Bookmark Link" or
            "Add to Bookmarks".
          </Typography>
          <Box
            sx={{
              bgcolor: 'background.default',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              mb: 2,
              p: 3,
            }}
          >
            <a
              draggable="true"
              href="about:blank"
              ref={bookmarkletRef}
              style={{
                display: 'inline-block',
                textDecoration: 'none',
              }}
            >
              <Button
                sx={{
                  '&:active': { cursor: 'grabbing' },
                  '&:hover': { bgcolor: 'primary.dark' },
                  bgcolor: 'primary.main',
                  cursor: 'grab',
                }}
                variant="contained"
              >
                Get Vault Cookies
              </Button>
            </a>
          </Box>
          <Typography color="text.secondary" variant="caption">
            Bookmarklet code:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            size="small"
            slotProps={{ htmlInput: { readOnly: true } }}
            sx={{ mt: 1 }}
            value={bookmarkletCode}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookmarkletOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Configuration Dialog */}
      <Dialog disableScrollLock onClose={() => setDeleteDialogOpen(false)} open={deleteDialogOpen}>
        <DialogTitle>Delete Configuration</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete configuration <b>{selectedConfigId}</b>? This cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button color="error" onClick={handleDeleteConfirm} variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <FeedbackSnackbar
        message={snackbar.message}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        open={snackbar.open}
        severity={snackbar.severity}
      />
    </>
  );
}
