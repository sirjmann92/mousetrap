import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

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
    <Dialog disableScrollLock={true} onClose={onClose} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelLabel}</Button>
        <Button
          color={/** @type {import('@mui/material').ButtonProps['color']} */ (confirmColor)}
          onClick={() => {
            onClose();
            onConfirm();
          }}
          variant="contained"
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
