import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CelebrationIcon from '@mui/icons-material/Celebration';
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
  Checkbox,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import FeedbackSnackbar from './FeedbackSnackbar';

export default function VaultConfigCard({ proxies, sessions }) {
  // Internal state management - no longer depends on parent props
  const [vaultConfigurations, setVaultConfigurations] = useState({});
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [snackbar, setSnackbar] = useState({
    message: '',
    open: false,
    severity: 'success',
  });
  const [manualDonationAmount, setManualDonationAmount] = useState(100);

  // CRUD state - simplified like SessionSelector
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Bookmarklet state
  const [bookmarkletOpen, setBookmarkletOpen] = useState(false);

  // Create new config state - like Create New Session workflow
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [workingConfigName, setWorkingConfigName] = useState('');

  // MAM ID visibility state - like session card
  const [showBrowserMamId, setShowBrowserMamId] = useState(false);
  const [vaultPoints, setVaultPoints] = useState(null);
  const [vaultTotalPoints, setVaultTotalPoints] = useState(null);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Bookmarklet code - extract both mam_id and uid cookies from browser
  const bookmarkletCode = `javascript:(function(){try{if(!window.location.href.includes('myanonamouse.net')){alert('Please use this bookmarklet on MyAnonamouse.net');return;}var cookies=document.cookie.split(';');var mamId=null;var uid=null;for(var i=0;i<cookies.length;i++){var cookie=cookies[i].trim();if(cookie.startsWith('mam_id=')){mamId=cookie.substring(7);}else if(cookie.startsWith('uid=')){uid=cookie.substring(4);}}if(mamId&&uid){var browser='unknown';var ua=navigator.userAgent;if(ua.includes('Firefox')){browser='firefox';}else if(ua.includes('Chrome')&&!ua.includes('Edg')){browser='chrome';}else if(ua.includes('Edg')){browser='edge';}else if(ua.includes('Safari')&&!ua.includes('Chrome')){browser='safari';}else if(ua.includes('Opera')||ua.includes('OPR')){browser='opera';}var cookieString='mam_id='+mamId+'; uid='+uid+'; browser='+browser;if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(cookieString).then(function(){alert('Browser MAM ID copied to clipboard!\\n\\nThis includes both mam_id and uid cookies, plus browser type ('+browser+') for proper headers.');}).catch(function(){prompt('Browser MAM ID (copy this):',cookieString);});}else{prompt('Browser MAM ID (copy this):',cookieString);}}else{var missing=[];if(!mamId)missing.push('mam_id');if(!uid)missing.push('uid');alert('Missing required cookies: '+missing.join(', ')+'\\n\\nMake sure you are logged in to MyAnonamouse and try again.');}}catch(e){alert('Bookmarklet error: '+e.message);console.error('MAM Cookie Extractor Error:',e);}})();`;

  // Load vault configurations on mount
  // (moved) useEffect hooks for loading configurations are declared after the
  // loader functions to avoid referencing callbacks before they're defined.

  const loadVaultConfigurations = useCallback(async () => {
    try {
      const response = await fetch('/api/vault/configurations');
      if (response.ok) {
        const data = await response.json();
        const configurations = data.configurations || {};
        setVaultConfigurations(configurations);

        // Auto-select if there's only one configuration and no current selection
        const configKeys = Object.keys(configurations);
        if (configKeys.length === 1) {
          const autoSelectedId = configKeys[0];
          // Only set if nothing is currently selected - use functional update to avoid stale closure
          setSelectedConfigId((prev) => (prev ? prev : autoSelectedId));
        }
      } else {
        console.error('Error loading vault configurations');
        setVaultConfigurations({});
      }
    } catch (error) {
      console.error('Error loading vault configurations:', error);
      setVaultConfigurations({});
    }
  }, []);

  const loadVaultConfiguration = useCallback(async (configId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/vault/configuration/${configId}`);
      const data = await response.json();
      if (response.ok) {
        setCurrentConfig(data);
      } else {
        console.error('Error loading vault configuration:', data.error);
      }
    } catch (error) {
      console.error('Error loading vault configuration:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load vault configurations on mount
  useEffect(() => {
    loadVaultConfigurations();
  }, [loadVaultConfigurations]);

  // Load current configuration when selection changes - but not for new configs being created
  useEffect(() => {
    if (selectedConfigId && !isCreatingNew) {
      loadVaultConfiguration(selectedConfigId);
    } else if (!selectedConfigId) {
      setCurrentConfig(null);
    }
  }, [selectedConfigId, isCreatingNew, loadVaultConfiguration]);

  const handleCreateConfiguration = async () => {
    // Generate a unique default name (like Create New Session)
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

      // Enter "create new" mode - like Create New Session workflow
      setIsCreatingNew(true);
      setSelectedConfigId(configId);
      setWorkingConfigName(configId);
      setCurrentConfig(defaultConfig);
      setExpanded(true);

      setSnackbar({
        message: 'New configuration ready! Fill in the required fields and save.',
        open: true,
        severity: 'info',
      });
    } catch (_error) {
      setSnackbar({
        message: 'Error creating configuration',
        open: true,
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!currentConfig) return;

    setShowValidation(true); // Show validation errors on save attempt

    // Use the working name for new configs, or selected ID for existing
    const configIdToSave = isCreatingNew ? workingConfigName : selectedConfigId;

    if (!configIdToSave) {
      setSnackbar({
        message: 'Configuration name is required',
        open: true,
        severity: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);
      setSaveStatus(null);

      const response = await fetch(`/api/vault/configuration/${configIdToSave}`, {
        body: JSON.stringify(currentConfig),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSaveStatus({
          message: 'Configuration saved successfully!',
          type: 'success',
        });
        setSnackbar({
          message: 'Configuration saved successfully!',
          open: true,
          severity: 'success',
        });
        setTimeout(() => setSaveStatus(null), 3000);

        // Exit create mode and switch to saved config
        if (isCreatingNew) {
          setIsCreatingNew(false);
          setSelectedConfigId(configIdToSave);
        }

        await loadVaultConfigurations();

        // Fetch updated points after save (especially if session changed)
        if (currentConfig) {
          await fetchVaultPoints(currentConfig);
        }
      } else {
        // Handle validation errors or save failures
        const errorMessage = data.errors
          ? data.errors.join(', ')
          : data.detail || data.error || 'Failed to save configuration';
        setSaveStatus({ message: errorMessage, type: 'error' });
        setSnackbar({ message: errorMessage, open: true, severity: 'error' });
        setTimeout(() => setSaveStatus(null), 5000);
      }
    } catch (_error) {
      setSaveStatus({ message: 'Error saving configuration', type: 'error' });
      setSnackbar({
        message: 'Error saving configuration',
        open: true,
        severity: 'error',
      });
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateConfiguration = async () => {
    if (!currentConfig) return;

    // Use the working name for new configs, or selected ID for existing
    const configIdToValidate = isCreatingNew ? workingConfigName : selectedConfigId;

    if (!configIdToValidate) {
      setSnackbar({
        message: 'Configuration name is required',
        open: true,
        severity: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);
      setValidationResult(null);

      const response = await fetch(`/api/vault/configuration/${configIdToValidate}/validate`, {
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
        errors: ['Validation request failed'],
        vault_accessible: false,
      });
      setSnackbar({
        message: 'Validation request failed',
        open: true,
        severity: 'error',
      });
      setTimeout(() => setValidationResult(null), 7000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualDonation = async () => {
    if (!currentConfig || !manualDonationAmount) return;

    // For new configs, we can try to donate with browser cookies directly
    // Use the working name for new configs, or selected ID for existing
    const configIdToDonate = isCreatingNew ? workingConfigName : selectedConfigId;

    if (!configIdToDonate) {
      setSnackbar({
        message: 'Configuration name is required',
        open: true,
        severity: 'error',
      });
      return;
    }

    if (!currentConfig.browser_mam_id) {
      setSnackbar({
        message: 'Browser cookies are required for donation',
        open: true,
        severity: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);

      // For new unsaved configs, we'll pass the config data in the request body
      const requestBody = isCreatingNew
        ? {
            amount: manualDonationAmount,
            config: currentConfig,
          }
        : {
            amount: manualDonationAmount,
          };

      const response = await fetch(`/api/vault/configuration/${configIdToDonate}/donate`, {
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const data = await response.json();
      console.log('[VaultDonation] Response:', {
        data,
        status: response.status,
      });

      if (response.ok) {
        setSnackbar({
          message: `Successfully donated ${manualDonationAmount} points!`,
          open: true,
          severity: 'success',
        });

        // Update points display with data from donation response
        if (data.points_after !== undefined) {
          setVaultPoints(data.points_after);
          console.log('[VaultDonation] Points updated from donation response:', data.points_after);
        } else if (currentConfig) {
          // Fallback: refresh points display if no points data in response
          fetchVaultPoints(currentConfig);
        }

        // Update vault total if provided in response
        if (data.vault_total_points !== undefined) {
          setVaultTotalPoints(data.vault_total_points);
          console.debug(
            '[VaultDonation] Vault total updated from donation response:',
            data.vault_total_points,
          );
        }

        // Always refresh vault total after donation to ensure persistence
        // Use multiple refresh attempts to handle any timing issues
        // Preserve existing value on error to prevent disappearing
        setTimeout(() => {
          console.debug('First vault total refresh after donation');
          fetchVaultTotal(true);
        }, 1000);

        setTimeout(() => {
          console.debug('Second vault total refresh after donation');
          fetchVaultTotal(true);
        }, 3000);

        setTimeout(() => {
          console.debug('Final vault total refresh after donation');
          fetchVaultTotal(true);
        }, 5000);
      } else {
        console.error('[VaultDonation] Donation failed:', data);
        setSnackbar({
          message: data.detail || data.error || 'Donation failed',
          open: true,
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('[VaultDonation] Request failed:', error);
      setSnackbar({
        message: 'Donation request failed',
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
        await loadVaultConfigurations();
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

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const generateBookmarklet = () => {
    setBookmarkletOpen(true);
  };

  const fetchVaultPoints = useCallback(
    async (config) => {
      if (!config || !selectedConfigId || !config.associated_session_label) {
        setVaultPoints(null);
        return;
      }

      // Don't fetch points for unsaved configurations
      if (isCreatingNew) {
        setVaultPoints(null);
        return;
      }

      setPointsLoading(true);
      try {
        const response = await fetch('/api/vault/points', {
          body: JSON.stringify({
            config_id: selectedConfigId,
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });

        const data = await response.json();

        if (data.success && typeof data.points === 'number') {
          setVaultPoints(data.points);
        } else {
          console.error('Failed to fetch vault points:', data.error || 'Unknown error');
          setVaultPoints(null);
        }
      } catch (error) {
        console.error('Error fetching vault points:', error);
        setVaultPoints(null);
      } finally {
        setPointsLoading(false);
      }
    },
    [selectedConfigId, isCreatingNew],
  );

  const fetchVaultTotal = useCallback(
    async (preserveOnError = false) => {
      // Don't fetch if there are no configurations loaded yet
      if (Object.keys(vaultConfigurations).length === 0) {
        console.debug('Skipping vault total fetch - no configurations loaded');
        return;
      }

      try {
        console.debug('Fetching vault total...');
        const response = await fetch('/api/vault/total');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setVaultTotalPoints(data.vault_total_points);
            console.debug('Vault total fetched successfully:', data.vault_total_points);
          } else {
            // Only log as debug - this is expected when no vault configs exist yet
            console.debug('Vault total not available:', data.error);
            if (!preserveOnError) {
              setVaultTotalPoints(null);
            }
          }
        } else {
          console.debug('Failed to fetch vault total - likely no configurations yet');
          if (!preserveOnError) {
            setVaultTotalPoints(null);
          }
        }
      } catch (error) {
        console.debug('Error fetching vault total:', error);
        if (!preserveOnError) {
          setVaultTotalPoints(null);
        }
      }
    },
    [vaultConfigurations],
  );

  // Fetch points when configuration is selected and has associated session
  useEffect(() => {
    if (
      currentConfig &&
      selectedConfigId &&
      currentConfig.associated_session_label &&
      !isCreatingNew
    ) {
      const timeoutId = setTimeout(() => {
        fetchVaultPoints(currentConfig);
      }, 500); // Debounce API calls
      return () => clearTimeout(timeoutId);
    } else {
      setVaultPoints(null);
    }
  }, [
    selectedConfigId,
    currentConfig?.associated_session_label,
    isCreatingNew,
    currentConfig,
    fetchVaultPoints,
  ]);

  // Fetch vault total when component mounts and when vault configurations are loaded
  useEffect(() => {
    // Only fetch vault total if there are configurations that might have browser cookies
    if (Object.keys(vaultConfigurations).length > 0) {
      fetchVaultTotal();
    }
  }, [vaultConfigurations, fetchVaultTotal]);

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
            Millionaire's Vault Configuration
          </Typography>
          {/* Vault Total styled like Points in PerkAutomationCard header */}
          {vaultTotalPoints !== null && (
            <Typography sx={{ color: 'primary.main', mr: 2 }} variant="body1">
              🏆 Vault Total: <b>{vaultTotalPoints.toLocaleString()}</b> points
            </Typography>
          )}
          <IconButton size="small">{expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 0 }}>
            {/* Padding above first row, only visible when expanded */}
            <Box sx={{ height: 7 }} />
            {/* Configuration selector with CRUD controls */}
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
                  {Object.keys(vaultConfigurations).map((configId) => (
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

            {/* Status Messages */}
            {saveStatus && (
              <Alert severity={saveStatus.type} sx={{ mb: 2 }}>
                {saveStatus.message}
              </Alert>
            )}

            {validationResult && (
              <Alert
                severity={
                  validationResult.config_valid && validationResult.vault_accessible
                    ? 'success'
                    : 'error'
                }
                sx={{ mb: 2 }}
              >
                {validationResult.config_valid && validationResult.vault_accessible
                  ? 'Vault access validated successfully!'
                  : validationResult.errors?.join(', ') ||
                    validationResult.error ||
                    'Validation failed'}
              </Alert>
            )}

            {/* Configuration Form */}
            {currentConfig && (
              <>
                <Divider sx={{ mb: 3 }} />

                {/* First row: Configuration Name (when creating) OR Last Donation (when viewing) */}
                {isCreatingNew ? (
                  // Show Configuration Name field when creating new
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      error={isCreatingNew && !workingConfigName}
                      helperText={isCreatingNew ? 'Required for new configurations' : ''}
                      label="Configuration Name"
                      onChange={(e) => {
                        setWorkingConfigName(e.target.value);
                      }}
                      placeholder="Enter configuration name"
                      required
                      size="small"
                      sx={{ width: 300 }}
                      value={workingConfigName}
                    />
                  </Box>
                ) : (
                  // Show Last Donation when viewing existing config
                  currentConfig.automation?.last_run && (
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, mb: 0.5 }}>
                        <CelebrationIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        <Typography
                          sx={{ color: 'success.main', fontWeight: 'bold' }}
                          variant="body2"
                        >
                          Last Donation
                        </Typography>
                        <CelebrationIcon sx={{ color: 'success.main', fontSize: 20 }} />
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="body2">
                          <strong>Time:</strong>{' '}
                          {new Date(currentConfig.automation.last_run * 1000).toLocaleString()}
                        </Typography>
                        {currentConfig.automation.donation_amount && (
                          <Typography variant="body2">
                            <strong>Amount:</strong> {currentConfig.automation.donation_amount}{' '}
                            points
                          </Typography>
                        )}
                        <Typography variant="body2">
                          <strong>Type:</strong>{' '}
                          {currentConfig.pot_tracking?.last_donation_type === 'manual'
                            ? 'Manual'
                            : 'Automated'}
                        </Typography>
                      </Box>
                    </Box>
                  )
                )}

                {/* Associated Session - for UID and points source */}
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
                    title="Associated session is required for points display and notifications. Without it, you can still perform manual donations but won't see current points or receive notifications."
                  >
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {/* Points Display - now just to the right of selector and tooltip */}
                  {currentConfig?.associated_session_label &&
                    (pointsLoading ? (
                      <>
                        <CircularProgress size={14} />
                        <Typography color="text.secondary" variant="subtitle1">
                          Loading...
                        </Typography>
                      </>
                    ) : vaultPoints !== null &&
                      vaultPoints !== undefined &&
                      typeof vaultPoints === 'number' ? (
                      <Typography
                        sx={{ color: 'success.main', fontWeight: 600 }}
                        variant="subtitle1"
                      >
                        Points: {vaultPoints.toLocaleString()}
                      </Typography>
                    ) : (
                      <Typography color="error.main" sx={{ fontWeight: 500 }} variant="subtitle1">
                        Points: Error
                      </Typography>
                    ))}
                </Box>

                {/* Browser MAM ID - simplified for cookie extraction */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    error={showValidation && !currentConfig.browser_mam_id}
                    helperText={
                      showValidation && !currentConfig.browser_mam_id
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

                {/* Action buttons - reorganized layout without save button */}
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

                  {/* Right side - only cancel button for new configs */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
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
                  </Box>
                </Box>

                {/* Manual Donation and Automation Settings */}
                <Divider sx={{ my: 3 }} />

                {/* Manual Donation Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ mb: 1 }} variant="subtitle1">
                    Manual Donation
                  </Typography>
                  <Box sx={{ alignItems: 'center', display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ width: 150 }}>
                      <InputLabel>Donation Amount</InputLabel>
                      <Select
                        label="Donation Amount"
                        MenuProps={{ disableScrollLock: true }}
                        onChange={(e) =>
                          setManualDonationAmount(
                            /** @type {any} */ (Number(/** @type {any} */ (e.target.value))),
                          )
                        }
                        value={manualDonationAmount}
                      >
                        {[
                          100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400,
                          1500, 1600, 1700, 1800, 1900, 2000,
                        ].map((amount) => (
                          <MenuItem key={amount} value={amount}>
                            {amount} points
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      disabled={isLoading || !currentConfig.browser_mam_id || !manualDonationAmount}
                      onClick={handleManualDonation}
                      sx={{ height: 40, minWidth: 140 }}
                      variant="outlined"
                    >
                      Donate Now
                    </Button>
                  </Box>
                </Box>

                {/* Automation Settings Section */}
                <Box>
                  <Typography sx={{ mb: 1 }} variant="subtitle1">
                    Vault Automation
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={currentConfig.automation?.enabled || false}
                            onChange={(e) =>
                              setCurrentConfig({
                                ...currentConfig,
                                automation: {
                                  ...(currentConfig.automation || {}),
                                  enabled: e.target.checked,
                                },
                              })
                            }
                          />
                        }
                        label="Enable Vault Automation"
                      />
                      <Tooltip
                        arrow
                        placement="right"
                        title="When enabled for the first time, automation will run immediately after saving to establish the schedule"
                      >
                        <IconButton size="small" sx={{ ml: 0.5 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {currentConfig.automation?.enabled && (
                      <Box
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 2,
                        }}
                      >
                        <Tooltip arrow title="How often to check points (1-168 hours)">
                          <TextField
                            label="Frequency (hours)"
                            onChange={(e) =>
                              setCurrentConfig({
                                ...currentConfig,
                                automation: {
                                  ...(currentConfig.automation || {}),
                                  frequency_hours: parseInt(e.target.value, 10) || 24,
                                },
                              })
                            }
                            size="small"
                            slotProps={{
                              htmlInput: {
                                min: 1,
                                max: 168,
                              },
                            }}
                            sx={{ width: 130 }}
                            type="number"
                            value={currentConfig.automation?.frequency_hours || 24}
                          />
                        </Tooltip>

                        <Tooltip arrow title="Minimum points before donating">
                          <TextField
                            label="Points Threshold"
                            onChange={(e) =>
                              setCurrentConfig({
                                ...currentConfig,
                                automation: {
                                  ...(currentConfig.automation || {}),
                                  min_points_threshold: parseInt(e.target.value, 10) || 2000,
                                },
                              })
                            }
                            size="small"
                            slotProps={{
                              htmlInput: {
                                min: 0,
                              },
                            }}
                            sx={{ width: 130 }}
                            type="number"
                            value={currentConfig.automation?.min_points_threshold || 2000}
                          />
                        </Tooltip>

                        <FormControl size="small" sx={{ width: 150 }}>
                          <InputLabel>Donation Amount</InputLabel>
                          <Select
                            label="Donation Amount"
                            MenuProps={{ disableScrollLock: true }}
                            onChange={(e) =>
                              setCurrentConfig({
                                ...currentConfig,
                                automation: {
                                  ...(currentConfig.automation || {}),
                                  donation_amount: parseInt(e.target.value, 10),
                                },
                              })
                            }
                            value={currentConfig.automation?.donation_amount || 100}
                          >
                            {[
                              100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300,
                              1400, 1500, 1600, 1700, 1800, 1900, 2000,
                            ].map((amount) => (
                              <MenuItem key={amount} value={amount}>
                                {amount} points
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {/* Once per pot option moved to same row */}
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={currentConfig.automation?.once_per_pot || false}
                              onChange={(e) =>
                                setCurrentConfig({
                                  ...currentConfig,
                                  automation: {
                                    ...(currentConfig.automation || {}),
                                    once_per_pot: e.target.checked,
                                  },
                                })
                              }
                            />
                          }
                          label={
                            <Box sx={{ alignItems: 'center', display: 'flex' }}>
                              Only donate once per pot cycle
                              <Tooltip
                                arrow
                                title="When enabled, this prevents multiple donations to the same 20M pot cycle. The system tracks pot cycles and will only donate once per ~20 million point pot, regardless of how often automation runs."
                              >
                                <IconButton size="small" sx={{ ml: 1 }}>
                                  <InfoOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          }
                        />
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Save Button at the bottom */}
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
          </CardContent>
        </Collapse>
      </Card>

      {/* Delete Configuration Dialog */}
      <Dialog disableScrollLock onClose={handleDeleteCancel} open={deleteDialogOpen}>
        <DialogTitle>Delete Configuration</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete configuration <b>{selectedConfigId}</b>? This cannot be
            undone.
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
              href={bookmarkletCode}
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
