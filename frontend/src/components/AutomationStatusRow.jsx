import React from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export default function AutomationStatusRow({ autoWedge, autoVIP, autoUpload, vaultAutomation }) {
  return (
    <Box sx={{ mt: 2, mb: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 1 }}>Automation:</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>Wedge:</Typography>
          {autoWedge ? (
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 22, position: 'relative', top: '-1px' }} />
          ) : (
            <CancelIcon sx={{ color: 'error.main', fontSize: 22, position: 'relative', top: '-1px' }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>VIP Time:</Typography>
          {autoVIP ? (
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 22, position: 'relative', top: '-1px' }} />
          ) : (
            <CancelIcon sx={{ color: 'error.main', fontSize: 22, position: 'relative', top: '-1px' }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>Upload Credit:</Typography>
          {autoUpload ? (
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 22, position: 'relative', top: '-1px' }} />
          ) : (
            <CancelIcon sx={{ color: 'error.main', fontSize: 22, position: 'relative', top: '-1px' }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>Vault:</Typography>
          {vaultAutomation ? (
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 22, position: 'relative', top: '-1px' }} />
          ) : (
            <CancelIcon sx={{ color: 'error.main', fontSize: 22, position: 'relative', top: '-1px' }} />
          )}
        </Box>
      </Box>
    </Box>
  );
}
