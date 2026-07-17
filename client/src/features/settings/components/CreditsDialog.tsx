import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Dialog, DialogContent, DialogTitle, IconButton, Link, Stack, Typography } from '@mui/material';

interface CreditsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreditsDialog({ open, onClose }: CreditsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Credits
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} alignItems="center" textAlign="center" sx={{ pb: 2 }}>
          <Typography variant="body1">
            Made with <FavoriteRoundedIcon sx={{ fontSize: 16, color: 'error.main', verticalAlign: 'text-bottom' }} /> by
            Vaibhav Sen
          </Typography>
          <Stack spacing={1.25} alignItems="center">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}
            >
              <EmailRoundedIcon fontSize="small" />
              cheeseburst06@gmail.com
            </Typography>
            <Link
              href="https://github.com/vabxsen/Slip"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="text.secondary"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}
            >
              <GitHubIcon fontSize="small" />
              github.com/vabxsen/Slip
            </Link>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
