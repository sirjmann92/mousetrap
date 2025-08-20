import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

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
        <Button onClick={() => { onClose(); onConfirm(); }} color={confirmColor} variant="contained">{confirmLabel}</Button>
      </DialogActions>
    </Dialog>
  );
}
