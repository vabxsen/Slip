import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface SignOutDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SignOutDialog({ open, onClose, onConfirm }: SignOutDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Sign out?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You&apos;ll need to sign in again to access your synced personal info, trusted devices, and
          history on this device.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          color="error"
          variant="contained"
        >
          Sign out
        </Button>
      </DialogActions>
    </Dialog>
  );
}
