import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Typography } from '@mui/material';

export default function AutomationStatusRow({ autoWedge, autoVIP, autoUpload, vaultAutomation }) {
  return (
    <Box sx={{ mb: 1, mt: 2 }}>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
        }}
      >
        <Typography sx={{ fontWeight: 600, mr: 1 }} variant="subtitle1">
          Automation:
        </Typography>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}>
          <Typography sx={{ fontWeight: 500 }} variant="body2">
            Wedge:
          </Typography>
          {autoWedge ? (
            <CheckCircleIcon
              sx={{
                color: 'success.main',
                fontSize: 22,
                position: 'relative',
                top: '-1px',
              }}
            />
          ) : (
            <CancelIcon
              sx={{
                color: 'error.main',
                fontSize: 22,
                position: 'relative',
                top: '-1px',
              }}
            />
          )}
        </Box>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5, ml: 2 }}>
          <Typography sx={{ fontWeight: 500 }} variant="body2">
            VIP Time:
          </Typography>
          {autoVIP ? (
            <CheckCircleIcon
              sx={{
                color: 'success.main',
                fontSize: 22,
                position: 'relative',
                top: '-1px',
              }}
            />
          ) : (
            <CancelIcon
              sx={{
                color: 'error.main',
                fontSize: 22,
                position: 'relative',
                top: '-1px',
              }}
            />
          )}
        </Box>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5, ml: 2 }}>
          <Typography sx={{ fontWeight: 500 }} variant="body2">
            Upload Credit:
          </Typography>
          {autoUpload ? (
            <CheckCircleIcon
              sx={{
                color: 'success.main',
                fontSize: 22,
                position: 'relative',
                top: '-1px',
              }}
            />
          ) : (
            <CancelIcon
              sx={{
                color: 'error.main',
                fontSize: 22,
                position: 'relative',
                top: '-1px',
              }}
            />
          )}
        </Box>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5, ml: 2 }}>
          <Typography sx={{ fontWeight: 500 }} variant="body2">
            Vault:
          </Typography>
          {vaultAutomation ? (
            <CheckCircleIcon
              sx={{
                color: 'success.main',
                fontSize: 22,
                position: 'relative',
                top: '-1px',
              }}
            />
          ) : (
            <CancelIcon
              sx={{
                color: 'error.main',
                fontSize: 22,
                position: 'relative',
                top: '-1px',
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
