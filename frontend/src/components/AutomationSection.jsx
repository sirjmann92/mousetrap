import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

/**
 * Generic automation section for PerkAutomationCard (Wedge, VIP, Upload, etc)
 * Props:
 * - title: string
 * - enabled: boolean
 * - onToggle: function
 * - toggleLabel: string
 * - toggleDisabled: boolean
 * - selectLabel: string
 * - selectValue: any
 * - selectOptions: array of { value, label }
 * - onSelectChange: function
 * - extraControls: React node (optional)
 * - triggerType: string
 * - onTriggerTypeChange: function
 * - triggerTypeValue: string
 * - triggerDays: number
 * - onTriggerDaysChange: function
 * - triggerPointThreshold: number
 * - onTriggerPointThresholdChange: function
 * - confirmButton: React node (optional)
 * - tooltip: string (optional)
 */
export default function AutomationSection({
  title,
  enabled,
  onToggle,
  toggleLabel,
  toggleDisabled = false,
  selectLabel,
  selectValue,
  selectOptions = [],
  onSelectChange,
  extraControls = null,
  onTriggerTypeChange,
  triggerTypeValue,
  triggerDays,
  onTriggerDaysChange,
  triggerPointThreshold,
  onTriggerPointThresholdChange,
  confirmButton = null,
  tooltip = '',
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ mb: 1 }} variant="subtitle1">
        {title}
      </Typography>
      <Box sx={{ alignItems: 'center', display: 'flex', mb: 2, width: '100%' }}>
        <Tooltip arrow disableHoverListener={!tooltip} title={tooltip}>
          <span>
            <FormControlLabel
              control={<Checkbox checked={enabled} disabled={toggleDisabled} onChange={onToggle} />}
              label={<span>{toggleLabel}</span>}
              sx={{ flexShrink: 0, minWidth: 220, mr: 3, whiteSpace: 'nowrap' }}
            />
          </span>
        </Tooltip>
        {selectLabel && (
          <FormControl size="small" sx={{ flexShrink: 0, minWidth: 120, mr: 1 }}>
            <InputLabel>{selectLabel}</InputLabel>
            <Select
              label={selectLabel}
              MenuProps={{ disableScrollLock: true }}
              onChange={onSelectChange}
              value={selectValue}
            >
              {selectOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {extraControls}
        <Box sx={{ flexGrow: 1 }} />
        {confirmButton}
      </Box>
      {/* Trigger options row */}
      <Grid alignItems="center" container spacing={2} sx={{ mb: 2, mt: 1 }}>
        <Grid item>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Trigger Type</InputLabel>
            <Select
              label="Trigger Type"
              MenuProps={{ disableScrollLock: true }}
              onChange={onTriggerTypeChange}
              value={triggerTypeValue}
            >
              <MenuItem value="time">Time-based</MenuItem>
              <MenuItem value="points">Point-based</MenuItem>
              <MenuItem value="both">Both</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {(triggerTypeValue === 'time' || triggerTypeValue === 'both') && (
          <Grid item>
            <TextField
              label="Every X Days"
              onChange={onTriggerDaysChange}
              size="small"
              sx={{ minWidth: 120 }}
              type="number"
              value={triggerDays}
            />
          </Grid>
        )}
        {(triggerTypeValue === 'points' || triggerTypeValue === 'both') && (
          <Grid item>
            <TextField
              label="Point Threshold"
              onChange={onTriggerPointThresholdChange}
              size="small"
              sx={{ minWidth: 140 }}
              type="number"
              value={triggerPointThreshold}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
