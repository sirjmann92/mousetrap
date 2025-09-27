import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React from 'react';

/**
 * Reusable confirmation dialog for automation actions.
 * Props:
 * - open: boolean
 * - onClose: function
 * - onConfirm: function
 * - title: string
 * - message: string or React node
 * - confirmLabel: string (default: 'Confirm')
 * - cancelLabel: string (default: 'Cancel')
 * - confirmColor: string (default: 'primary')
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'primary',
}) {
  return (
    <Dialog open={open} onClose={onClose} disableScrollLock={true}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelLabel}</Button>
        <Button
          onClick={() => {
            onClose();
            onConfirm();
          }}
          color={confirmColor}
          variant="contained"
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
