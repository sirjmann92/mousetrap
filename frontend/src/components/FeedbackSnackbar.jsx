import { Alert, Snackbar } from '@mui/material';
import { stringifyMessage } from '../utils/utils';

/**
 * Reusable snackbar for showing feedback messages.
 * Props:
 * - open: boolean
 * - message: string or any
 * - severity: 'success' | 'error' | 'info' | 'warning'
 * - onClose: function
 */
export default function FeedbackSnackbar({ open, message, severity = 'info', onClose }) {
  return (
    <Snackbar autoHideDuration={6000} onClose={onClose} open={open}>
      <Alert
        onClose={onClose}
        severity={/** @type {import('@mui/material').AlertColor} */ (severity)}
        sx={{ width: '100%' }}
      >
        {stringifyMessage(message)}
      </Alert>
    </Snackbar>
  );
}
