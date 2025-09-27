import { Box, Typography } from '@mui/material';

export default function TimerDisplay({ timer }) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        mb: 1,
        mt: 2,
      }}
    >
      <Typography sx={{ fontWeight: 600, letterSpacing: 1, mb: 1 }} variant="subtitle1">
        Next check in:
      </Typography>
      <Box
        sx={{
          background: '#222',
          borderRadius: 2,
          boxShadow: 2,
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: { md: '3.2rem', sm: '2.8rem', xs: '2.2rem' },
          letterSpacing: 2,
          minWidth: 220,
          px: 4,
          py: 2,
          textAlign: 'center',
        }}
      >
        {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
      </Box>
    </Box>
  );
}
