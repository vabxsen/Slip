import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface ClearHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ClearHistoryDialog({ open, onClose, onConfirm }: ClearHistoryDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Clear transfer history?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This removes the list of past transfers from this device. It only affects this history —
          files were never stored anywhere to begin with.
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
          Clear history
        </Button>
      </DialogActions>
    </Dialog>
  );
}
