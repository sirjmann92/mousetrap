import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Alert,
  IconButton,
  Collapse,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Checkbox,
  Chip,
  DialogContentText,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FeedbackSnackbar from './FeedbackSnackbar';

export default function VaultConfigCard({ proxies, sessions }) {
  // Internal state management - no longer depends on parent props
  const [vaultConfigurations, setVaultConfigurations] = useState({});
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [manualDonationAmount, setManualDonationAmount] = useState(100);
  
  // CRUD state - simplified like SessionSelector
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Bookmarklet state
  const [bookmarkletOpen, setBookmarkletOpen] = useState(false);
  
  // Create new config state - like Create New Session workflow
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [workingConfigName, setWorkingConfigName] = useState("");
  
  // MAM ID visibility state - like session card
  const [showBrowserMamId, setShowBrowserMamId] = useState(false);
  const [vaultPoints, setVaultPoints] = useState(null);
  const [vaultTotalPoints, setVaultTotalPoints] = useState(null);
  const [pointsLoading, setPointsLoading] = useState(false);
  
  // Bookmarklet code - extract both mam_id and uid cookies from browser
  const bookmarkletCode = `javascript:(function(){try{if(!window.location.href.includes('myanonamouse.net')){alert('Please use this bookmarklet on MyAnonamouse.net');return;}var cookies=document.cookie.split(';');var mamId=null;var uid=null;for(var i=0;i<cookies.length;i++){var cookie=cookies[i].trim();if(cookie.startsWith('mam_id=')){mamId=cookie.substring(7);}else if(cookie.startsWith('uid=')){uid=cookie.substring(4);}}if(mamId&&uid){var cookieString='mam_id='+mamId+'; uid='+uid;if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(cookieString).then(function(){alert('Browser MAM ID copied to clipboard!\\n\\nThis includes both mam_id and uid cookies needed for vault access.');}).catch(function(){prompt('Browser MAM ID (copy this):',cookieString);});}else{prompt('Browser MAM ID (copy this):',cookieString);}}else{var missing=[];if(!mamId)missing.push('mam_id');if(!uid)missing.push('uid');alert('Missing required cookies: '+missing.join(', ')+'\\n\\nMake sure you are logged in to MyAnonamouse and try again.');}}catch(e){alert('Bookmarklet error: '+e.message);console.error('MAM Cookie Extractor Error:',e);}})();`;

  // Load vault configurations on mount
  useEffect(() => {
    loadVaultConfigurations();
  }, []);

  // Load current configuration when selection changes - but not for new configs being created
  useEffect(() => {
    if (selectedConfigId && !isCreatingNew) {
      loadVaultConfiguration(selectedConfigId);
    } else if (!selectedConfigId) {
      setCurrentConfig(null);
    }
  }, [selectedConfigId, isCreatingNew]);

  const loadVaultConfigurations = async () => {
    try {
      const response = await fetch('/api/vault/configurations');
      if (response.ok) {
        const data = await response.json();
        setVaultConfigurations(data.configurations || {});
      } else {
        console.error('Error loading vault configurations');
        setVaultConfigurations({});
      }
    } catch (error) {
      console.error('Error loading vault configurations:', error);
      setVaultConfigurations({});
    }
  };

  const loadVaultConfiguration = async (configId) => {
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
  };

  const handleCreateConfiguration = async () => {
    // Generate a unique default name (like Create New Session)
    let base = "Configuration";
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
        open: true, 
        message: 'New configuration ready! Fill in the required fields and save.', 
        severity: 'info' 
      });
      
    } catch (error) {
      setSnackbar({ open: true, message: 'Error creating configuration', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!currentConfig) return;
    
    // Use the working name for new configs, or selected ID for existing
    const configIdToSave = isCreatingNew ? workingConfigName : selectedConfigId;
    
    if (!configIdToSave) {
      setSnackbar({ open: true, message: 'Configuration name is required', severity: 'error' });
      return;
    }
    
    try {
      setIsLoading(true);
      setSaveStatus(null);
      
      const response = await fetch(`/api/vault/configuration/${configIdToSave}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentConfig)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSaveStatus({ type: 'success', message: 'Configuration saved successfully!' });
        setSnackbar({ open: true, message: 'Configuration saved successfully!', severity: 'success' });
        setTimeout(() => setSaveStatus(null), 3000);
        
        // Exit create mode and switch to saved config
        if (isCreatingNew) {
          setIsCreatingNew(false);
          setSelectedConfigId(configIdToSave);
        }
        
        await loadVaultConfigurations();
      } else {
        // Handle validation errors or save failures
        const errorMessage = data.errors ? data.errors.join(', ') : (data.detail || data.error || 'Failed to save configuration');
        setSaveStatus({ type: 'error', message: errorMessage });
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        setTimeout(() => setSaveStatus(null), 5000);
      }
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Error saving configuration' });
      setSnackbar({ open: true, message: 'Error saving configuration', severity: 'error' });
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
      setSnackbar({ open: true, message: 'Configuration name is required', severity: 'error' });
      return;
    }
    
    try {
      setIsLoading(true);
      setValidationResult(null);
      
      const response = await fetch(`/api/vault/configuration/${configIdToValidate}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentConfig)
      });
      
      const data = await response.json();
      console.log('[VaultValidation] Response data:', data);
      setValidationResult(data);
      
      if (data.config_valid && data.vault_accessible) {
        setSnackbar({ open: true, message: 'Vault access validated successfully!', severity: 'success' });
        setTimeout(() => setValidationResult(null), 5000);
      } else {
        const errorMsg = data.errors?.join(', ') || data.detail || data.error || 'Validation failed';
        console.error('[VaultValidation] Validation failed:', data);
        setSnackbar({ open: true, message: errorMsg, severity: 'error' });
        setTimeout(() => setValidationResult(null), 7000);
      }
    } catch (error) {
      setValidationResult({ config_valid: false, vault_accessible: false, errors: ['Validation request failed'] });
      setSnackbar({ open: true, message: 'Validation request failed', severity: 'error' });
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
      setSnackbar({ open: true, message: 'Configuration name is required', severity: 'error' });
      return;
    }
    
    if (!currentConfig.browser_mam_id) {
      setSnackbar({ open: true, message: 'Browser cookies are required for donation', severity: 'error' });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // For new unsaved configs, we'll pass the config data in the request body
      const requestBody = isCreatingNew ? {
        amount: manualDonationAmount,
        config: currentConfig
      } : {
        amount: manualDonationAmount
      };
      
      const response = await fetch(`/api/vault/configuration/${configIdToDonate}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      console.log('[VaultDonation] Response:', { status: response.status, data });
      
      if (response.ok) {
        setSnackbar({ open: true, message: `Successfully donated ${manualDonationAmount} points!`, severity: 'success' });
        
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
          console.debug('[VaultDonation] Vault total updated from donation response:', data.vault_total_points);
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
        setSnackbar({ open: true, message: data.detail || data.error || 'Donation failed', severity: 'error' });
      }
    } catch (error) {
      console.error('[VaultDonation] Request failed:', error);
      setSnackbar({ open: true, message: 'Donation request failed', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedConfigId || isCreatingNew) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/vault/configuration/${selectedConfigId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSnackbar({ open: true, message: 'Configuration deleted successfully!', severity: 'success' });
        setDeleteDialogOpen(false);
        await loadVaultConfigurations();
        setSelectedConfigId("");
        setCurrentConfig(null);
      } else {
        const data = await response.json();
        setSnackbar({ open: true, message: data.detail || data.error || 'Error deleting configuration', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting configuration', severity: 'error' });
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

  const fetchVaultPoints = async (config) => {
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_id: selectedConfigId
        })
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
  };

  const fetchVaultTotal = async (preserveOnError = false) => {
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
  };

  // Fetch points when configuration is selected and has associated session
  useEffect(() => {
    if (currentConfig && selectedConfigId && currentConfig.associated_session_label && !isCreatingNew) {
      const timeoutId = setTimeout(() => {
        fetchVaultPoints(currentConfig);
      }, 500); // Debounce API calls
      return () => clearTimeout(timeoutId);
    } else {
      setVaultPoints(null);
    }
  }, [selectedConfigId, currentConfig?.associated_session_label, isCreatingNew]);

  // Fetch vault total when component mounts and when vault configurations are loaded
  useEffect(() => {
    // Only fetch vault total if there are configurations that might have browser cookies
    if (Object.keys(vaultConfigurations).length > 0) {
      fetchVaultTotal();
    }
  }, [vaultConfigurations]);

  return (
    <>
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer', 
            px: 2, 
            pt: 2, 
            pb: 1.5, 
            minHeight: 56 
          }} 
          onClick={() => setExpanded(e => !e)}
        >
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Millionaire's Vault Configuration
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
            {Object.keys(vaultConfigurations).length === 1 
              ? '1 config' 
              : `${Object.keys(vaultConfigurations).length} configs`}
          </Typography>
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        {/* Vault Total Display */}
        {vaultTotalPoints !== null && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
              🏆 Community Vault Total: {vaultTotalPoints.toLocaleString()} points
            </Typography>
          </Box>
        )}
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 0 }}>
            {/* Configuration selector with CRUD controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <FormControl size="small" sx={{ minWidth: 200, maxWidth: 300 }}>
                <InputLabel>Configuration</InputLabel>
                <Select 
                  value={selectedConfigId || ""} 
                  label="Configuration" 
                  onChange={(e) => {
                    if (!isCreatingNew) {
                      setSelectedConfigId(e.target.value);
                    }
                  }}
                  disabled={isCreatingNew}
                  MenuProps={{ disableScrollLock: true }}
                >
                  {Object.keys(vaultConfigurations).map(configId => (
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
                <IconButton color="success" sx={{ ml: 1 }} onClick={handleCreateConfiguration} disabled={isCreatingNew}>
                  <AddCircleOutlineIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Delete Configuration">
                <span>
                  <IconButton 
                    color="error" 
                    sx={{ ml: 1 }} 
                    onClick={() => setDeleteDialogOpen(true)} 
                    disabled={!selectedConfigId || isCreatingNew}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </span>
              </Tooltip>

              {/* Points Display - positioned to the right */}
              {currentConfig && currentConfig.associated_session_label && (
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                  {pointsLoading ? (
                    <>
                      <CircularProgress size={14} />
                      <Typography variant="subtitle1" color="text.secondary">Loading...</Typography>
                    </>
                  ) : (vaultPoints !== null && vaultPoints !== undefined && typeof vaultPoints === 'number') ? (
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'success.main' }}>
                      Points: {vaultPoints.toLocaleString()}
                    </Typography>
                  ) : (
                    <Typography variant="subtitle1" color="error.main" sx={{ fontWeight: 500 }}>
                      Points: Error
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* Status Messages */}
            {saveStatus && (
              <Alert severity={saveStatus.type} sx={{ mb: 2 }}>
                {saveStatus.message}
              </Alert>
            )}
            
            {validationResult && (
              <Alert severity={(validationResult.config_valid && validationResult.vault_accessible) ? 'success' : 'error'} sx={{ mb: 2 }}>
                {(validationResult.config_valid && validationResult.vault_accessible) 
                  ? 'Vault access validated successfully!' 
                  : (validationResult.errors?.join(', ') || validationResult.error || 'Validation failed')
                }
              </Alert>
            )}

            {/* Configuration Form */}
            {currentConfig && (
              <>
                <Divider sx={{ mb: 3 }} />
                
                {/* Configuration Name - editable during creation, display only after saved */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    label="Configuration Name"
                    value={isCreatingNew ? workingConfigName : selectedConfigId}
                    onChange={(e) => {
                      if (isCreatingNew) {
                        setWorkingConfigName(e.target.value);
                      }
                    }}
                    size="small"
                    sx={{ width: 300 }}
                    placeholder="Enter configuration name"
                    required
                    error={isCreatingNew && !workingConfigName}
                    disabled={!isCreatingNew}
                  />
                </Box>

                {/* Associated Session - for UID and points source */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <FormControl size="small" sx={{ width: 300 }}>
                      <InputLabel>Associated Session</InputLabel>
                      <Select
                        value={currentConfig.associated_session_label || ""}
                        label="Associated Session"
                        onChange={(e) => setCurrentConfig({...currentConfig, associated_session_label: e.target.value})}
                        MenuProps={{ disableScrollLock: true }}
                      >
                        <MenuItem value="">
                          <em>No session association</em>
                        </MenuItem>
                        {(sessions || []).map(sessionLabel => (
                          <MenuItem key={sessionLabel} value={sessionLabel}>
                            {sessionLabel}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Tooltip title="Associated session is required for points display and notifications. Without it, you can still perform manual donations but won't see current points or receive notifications." placement="right">
                      <IconButton size="small" sx={{ ml: 0.5 }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    Used for points display and vault operations
                  </Typography>
                </Box>

                {/* Browser MAM ID - simplified for cookie extraction */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    label="Browser MAM ID + UID"
                    value={
                      showBrowserMamId
                        ? (currentConfig.browser_mam_id || "")
                        : (currentConfig.browser_mam_id || "")
                          ? `mam_id=********...${(currentConfig.browser_mam_id || "").toString().slice(-20)}; uid=***...`
                          : ""
                    }
                    onChange={(e) => setCurrentConfig({...currentConfig, browser_mam_id: e.target.value})}
                    size="small"
                    required
                    error={!currentConfig.browser_mam_id}
                    inputProps={{ maxLength: 1000 }}
                    placeholder="mam_id=...; uid=..."
                    helperText="Required browser cookies for vault access"
                    sx={{ width: { xs: '100%', sm: 400, md: 450 } }}
                    type={showBrowserMamId ? "text" : "password"}
                    multiline
                    minRows={2}
                    maxRows={6}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showBrowserMamId ? "Hide Browser MAM ID" : "Show Browser MAM ID"}
                            onClick={() => setShowBrowserMamId(v => !v)}
                            edge="end"
                          >
                            {showBrowserMamId ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                {/* Connection Method - required field */}
                <Box sx={{ mb: 2 }}>
                  <FormControl size="small" sx={{ width: 300 }} required>
                    <InputLabel>Connection Method *</InputLabel>
                    <Select
                      value={currentConfig.connection_method || "direct"}
                      label="Connection Method"
                      onChange={(e) => setCurrentConfig({...currentConfig, connection_method: e.target.value})}
                      MenuProps={{ disableScrollLock: true }}
                      required
                    >
                      <MenuItem value="direct">Direct (Browser Connection)</MenuItem>
                      <MenuItem value="proxy">Via Proxy</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Vault Proxy - only show if proxy method selected */}
                {currentConfig.connection_method === "proxy" && (
                  <Box sx={{ mb: 2 }}>
                    <FormControl size="small" sx={{ width: 200 }}>
                      <InputLabel>Vault Proxy</InputLabel>
                      <Select
                        value={currentConfig.vault_proxy_label || ""}
                        label="Vault Proxy"
                        onChange={(e) => setCurrentConfig({...currentConfig, vault_proxy_label: e.target.value})}
                        MenuProps={{ disableScrollLock: true }}
                      >
                        <MenuItem value="">No Proxy</MenuItem>
                        {Object.keys(proxies || {}).map(proxyLabel => (
                          <MenuItem key={proxyLabel} value={proxyLabel}>{proxyLabel}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {/* Action buttons - reorganized layout without save button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 1 }}>
                  {/* Left side buttons */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={generateBookmarklet}
                      disabled={isLoading}
                      sx={{ minWidth: 140 }}
                    >
                      Get Browser Cookies
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleValidateConfiguration}
                      disabled={isLoading || !currentConfig.browser_mam_id}
                      sx={{ minWidth: 140 }}
                    >
                      Test Vault Access
                    </Button>
                  </Box>
                  
                  {/* Right side - only cancel button for new configs */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {isCreatingNew && (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setIsCreatingNew(false);
                          setSelectedConfigId("");
                          setCurrentConfig(null);
                          setWorkingConfigName("");
                        }}
                        disabled={isLoading}
                        sx={{ minWidth: 100 }}
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
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Manual Donation
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ width: 150 }}>
                      <InputLabel>Donation Amount</InputLabel>
                      <Select
                        value={manualDonationAmount}
                        label="Donation Amount"
                        onChange={(e) => setManualDonationAmount(parseInt(e.target.value))}
                        MenuProps={{ disableScrollLock: true }}
                      >
                        {[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000].map(amount => (
                          <MenuItem key={amount} value={amount}>{amount} points</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      onClick={handleManualDonation}
                      disabled={isLoading || !currentConfig.browser_mam_id || !manualDonationAmount}
                      sx={{ minWidth: 140 }}
                    >
                      Donate Now
                    </Button>
                  </Box>
                </Box>

                {/* Automation Settings Section */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Vault Automation
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={currentConfig.automation?.enabled || false}
                            onChange={(e) => setCurrentConfig({...currentConfig, automation: {...(currentConfig.automation || {}), enabled: e.target.checked}})}
                          />
                        }
                        label="Enable Vault Automation"
                      />
                      <Tooltip 
                        title="When enabled for the first time, automation will run immediately after saving to establish the schedule" 
                        arrow
                        placement="right"
                      >
                        <IconButton size="small" sx={{ ml: 0.5 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    {currentConfig.automation?.enabled && (
                      <>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Tooltip title="How often to check points (1-168 hours)" arrow>
                            <TextField
                              label="Frequency (hours)"
                              type="number"
                              value={currentConfig.automation?.frequency_hours || 24}
                              onChange={(e) => setCurrentConfig({...currentConfig, automation: {...(currentConfig.automation || {}), frequency_hours: parseInt(e.target.value) || 24}})}
                              size="small"
                              sx={{ width: 150 }}
                              inputProps={{ min: 1, max: 168 }}
                            />
                          </Tooltip>
                          
                          <Tooltip title="Minimum points before donating" arrow>
                            <TextField
                              label="Points Threshold"
                              type="number"
                              value={currentConfig.automation?.min_points_threshold || 2000}
                              onChange={(e) => setCurrentConfig({...currentConfig, automation: {...(currentConfig.automation || {}), min_points_threshold: parseInt(e.target.value) || 2000}})}
                              size="small"
                              sx={{ width: 150 }}
                              inputProps={{ min: 0 }}
                            />
                          </Tooltip>

                          <FormControl size="small" sx={{ width: 150 }}>
                            <InputLabel>Donation Amount</InputLabel>
                            <Select
                              value={currentConfig.automation?.donation_amount || 100}
                              label="Donation Amount"
                              onChange={(e) => setCurrentConfig({...currentConfig, automation: {...(currentConfig.automation || {}), donation_amount: parseInt(e.target.value)}})}
                              MenuProps={{ disableScrollLock: true }}
                            >
                              {[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000].map(amount => (
                                <MenuItem key={amount} value={amount}>{amount} points</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                        
                        {/* Once per pot option */}
                        <Box sx={{ mt: 2 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={currentConfig.automation?.once_per_pot || false}
                                onChange={(e) => setCurrentConfig({...currentConfig, automation: {...(currentConfig.automation || {}), once_per_pot: e.target.checked}})}
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Only donate once per pot cycle
                                <Tooltip title="When enabled, this prevents multiple donations to the same 20M pot cycle. The system tracks pot cycles and will only donate once per ~20 million point pot, regardless of how often automation runs." arrow>
                                  <IconButton size="small" sx={{ ml: 1 }}>
                                    <InfoOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            }
                          />
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>

                {/* Save Button at the bottom */}
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveConfiguration}
                    disabled={isLoading}
                    sx={{ minWidth: 180 }}
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
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} disableScrollLock>
        <DialogTitle>Delete Configuration</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete configuration <b>{selectedConfigId}</b>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary" variant="outlined">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Bookmarklet dialog */}
      <Dialog 
        open={bookmarkletOpen} 
        onClose={() => setBookmarkletOpen(false)}
        maxWidth="lg"
        fullWidth
        disableScrollLock
      >
        <DialogTitle>Get Browser Cookies for Vault Access</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            1. Drag the button below to your bookmarks bar
            <br />
            2. Go to MyAnonamouse.net in your browser and log in
            <br />
            3. Click the bookmarklet to extract both your <strong>mam_id</strong> and <strong>uid</strong> cookies
            <br />
            4. The cookies will be automatically copied to your clipboard
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2, p: 1, bgcolor: 'success.light', borderRadius: 1, color: 'success.contrastText' }}>
            ✨ <strong>New:</strong> This bookmarklet extracts everything needed for vault access in one click! No need for session association or manual configuration.
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2, p: 1, bgcolor: 'info.light', borderRadius: 1, color: 'info.contrastText' }}>
            💡 <strong>Tip:</strong> If you don't see your bookmarks bar, press <kbd>Ctrl+Shift+B</kbd> (Windows/Linux) or <kbd>Cmd+Shift+B</kbd> (Mac) to show it.
          </Typography>
          <Box sx={{ 
            p: 3, 
            bgcolor: 'background.default', 
            borderRadius: 1, 
            mb: 2,
            display: 'flex',
            justifyContent: 'center'
          }}>
            <a
              href={bookmarkletCode}
              style={{
                textDecoration: 'none',
                display: 'inline-block'
              }}
              draggable="true"
            >
              <Button
                variant="contained"
                sx={{ 
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                  cursor: 'grab',
                  '&:active': { cursor: 'grabbing' }
                }}
              >
                Get Vault Cookies
              </Button>
            </a>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Bookmarklet code:
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            value={bookmarkletCode}
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            inputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookmarkletOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <FeedbackSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </>
  );
}