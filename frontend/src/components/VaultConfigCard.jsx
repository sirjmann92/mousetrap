import CelebrationIcon from '@mui/icons-material/Celebration';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Collapse,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
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

export default function VaultConfigCard({
  _proxies,
  _sessions,
  vaultConfigurations,
  onConfigUpdate,
}) {
  // Props: vaultConfigurations passed from parent, managed there
  // Local state for UI
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [snackbar, setSnackbar] = useState({
    message: '',
    open: false,
    severity: 'success',
  });
  const [manualDonationAmount, setManualDonationAmount] = useState(100);

  const [vaultTotalPoints, setVaultTotalPoints] = useState(null);
  const [_showValidation, setShowValidation] = useState(false);

  // Use vaultConfigurations from props (managed by parent)
  // Auto-select if there's only one configuration and no current selection
  useEffect(() => {
    if (vaultConfigurations) {
      const configKeys = Object.keys(vaultConfigurations);
      if (configKeys.length === 1 && !selectedConfigId) {
        setSelectedConfigId(configKeys[0]);
      }
    }
  }, [vaultConfigurations, selectedConfigId]);

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

  // Load current configuration when selection changes
  useEffect(() => {
    if (selectedConfigId) {
      loadVaultConfiguration(selectedConfigId);
    } else {
      setCurrentConfig(null);
    }
  }, [selectedConfigId, loadVaultConfiguration]);

  const handleSaveConfiguration = async () => {
    if (!currentConfig) return;

    setShowValidation(true); // Show validation errors on save attempt

    if (!selectedConfigId) {
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

      const response = await fetch(`/api/vault/configuration/${selectedConfigId}`, {
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

        // Notify parent to refresh configurations
        if (onConfigUpdate) {
          await onConfigUpdate();
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

  const handleManualDonation = async () => {
    if (!currentConfig || !manualDonationAmount) return;

    if (!selectedConfigId) {
      setSnackbar({
        message: 'Configuration name is required',
        open: true,
        severity: 'error',
      });
      return;
    }

    // Log frontend donation attempt
    console.info(
      `[VaultDonation] Attempting manual donation of ${manualDonationAmount} points via config ${selectedConfigId}`,
    );
    console.debug('[VaultDonation] Current config browser_mam_id:', currentConfig.browser_mam_id);
    console.debug(
      '[VaultDonation] Current config connection_method:',
      currentConfig.connection_method,
    );

    try {
      setIsLoading(true);

      const requestBody = {
        amount: manualDonationAmount,
      };

      console.debug('[VaultDonation] Sending request body:', requestBody);

      const response = await fetch(`/api/vault/configuration/${selectedConfigId}/donate`, {
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const data = await response.json();
      console.debug('[VaultDonation] Response data:', data);

      if (response.ok && data.success) {
        console.info('[VaultDonation] Donation successful');
        setSnackbar({
          message: 'Donation successful!',
          open: true,
          severity: 'success',
        });

        // Reload configuration to show updated last donation
        if (selectedConfigId) {
          console.debug('[VaultDonation] Reloading configuration after donation');
          await loadVaultConfiguration(selectedConfigId);
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
            {/* Configuration selector */}
            <Box sx={{ mb: currentConfig ? 3 : 1 }}>
              <FormControl size="small" sx={{ maxWidth: 300, minWidth: 200 }}>
                <InputLabel>Configuration</InputLabel>
                <Select
                  label="Configuration"
                  MenuProps={{ disableScrollLock: true }}
                  onChange={(e) => {
                    setSelectedConfigId(e.target.value);
                  }}
                  value={selectedConfigId || ''}
                >
                  {Object.keys(vaultConfigurations).map((configId) => (
                    <MenuItem key={configId} value={configId}>
                      {configId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Status Messages */}
            {saveStatus && (
              <Alert severity={saveStatus.type} sx={{ mb: 2 }}>
                {saveStatus.message}
              </Alert>
            )}

            {/* Configuration Form */}
            {currentConfig && (
              <>
                <Divider sx={{ mb: 3 }} />

                {/* Last Donation Display */}
                {(currentConfig.last_donation_display || currentConfig.automation?.last_run) && (
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
                      {currentConfig.last_donation_display ? (
                        <>
                          <Typography variant="body2">
                            <strong>Time:</strong>{' '}
                            {new Date(
                              currentConfig.last_donation_display.timestamp,
                            ).toLocaleString()}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Amount:</strong> {currentConfig.last_donation_display.amount}{' '}
                            points
                          </Typography>
                          <Typography variant="body2">
                            <strong>Source:</strong> {currentConfig.last_donation_display.source}
                          </Typography>
                          {currentConfig.last_donation_display.type && (
                            <Typography variant="body2">
                              <strong>Type:</strong> {currentConfig.last_donation_display.type}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <>
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
                            <strong>Source:</strong> MouseTrap
                          </Typography>
                          <Typography variant="body2">
                            <strong>Type:</strong>{' '}
                            {currentConfig.pot_tracking?.last_donation_type === 'manual'
                              ? 'Manual'
                              : 'Automated'}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Divider - only show if Last Donation was displayed */}
                {(currentConfig.last_donation_display || currentConfig.automation?.last_run) && (
                  <Divider sx={{ mb: 3, mt: 1 }} />
                )}

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
                    Save Changes
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Collapse>
      </Card>

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
