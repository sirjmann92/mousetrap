import React from 'react';
import { Box, Typography } from '@mui/material';

export default function TimerDisplay({ timer }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, mb: 1 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, letterSpacing: 1 }}>
        Next check in:
      </Typography>
      <Box sx={{
        background: '#222',
        color: '#fff',
        px: 4,
        py: 2,
        borderRadius: 2,
        fontFamily: 'monospace',
        fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' },
        boxShadow: 2,
        minWidth: 220,
        textAlign: 'center',
        letterSpacing: 2
      }}>
        {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
      </Box>
    </Box>
  );
}
