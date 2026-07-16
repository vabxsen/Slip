import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface ClaimUsernameDialogProps {
  open: boolean;
  username: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ClaimUsernameDialog({ open, username, onClose, onConfirm }: ClaimUsernameDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Claim this username?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          @{username} can never be changed once claimed — it's permanently linked to your account.
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
          variant="contained"
        >
          Claim @{username}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
