import {
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/router/paths';
import { useConnectByUsername } from '../hooks/useConnectByUsername';

interface SendToUsernameDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SendToUsernameDialog({ open, onClose }: SendToUsernameDialogProps) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const { lookupStatus, profile, sendError, outgoing, lookup, send, reset } = useConnectByUsername();
  const wasPending = useRef(false);

  useEffect(() => {
    if (outgoing?.status === 'pending') wasPending.current = true;
    if (wasPending.current && outgoing === null && open) {
      // The pending request cleared itself with no decline — it was accepted
      // (handled by useConnectionListeners, which already started the peer session).
      wasPending.current = false;
      onClose();
      navigate(ROUTES.home);
    }
  }, [outgoing, open, onClose, navigate]);

  const handleClose = () => {
    reset();
    setUsername('');
    wasPending.current = false;
    onClose();
  };

  const handleLookup = (event: React.FormEvent) => {
    event.preventDefault();
    if (username.trim()) void lookup(username);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Send to username</DialogTitle>
      <DialogContent>
        {!profile && !outgoing && (
          <form onSubmit={handleLookup}>
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <TextField
                autoFocus
                fullWidth
                size="small"
                label="Username"
                autoComplete="off"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                error={lookupStatus === 'not-found'}
                helperText={lookupStatus === 'not-found' ? 'No user found with that username.' : ' '}
              />
              <Button
                type="submit"
                variant="outlined"
                disabled={!username.trim() || lookupStatus === 'looking-up'}
                sx={{ alignSelf: 'flex-start' }}
              >
                {lookupStatus === 'looking-up' ? 'Looking up…' : 'Look up'}
              </Button>
            </Stack>
          </form>
        )}

        {profile && !outgoing && (
          <Stack spacing={2} alignItems="center" sx={{ pt: 1 }}>
            <Avatar src={profile.photoURL ?? undefined} sx={{ width: 64, height: 64 }}>
              {(profile.displayName ?? profile.username).charAt(0).toUpperCase()}
            </Avatar>
            <Stack alignItems="center" spacing={0.5}>
              <Typography variant="subtitle1">{profile.displayName ?? profile.username}</Typography>
              <Typography variant="body2" color="text.secondary">
                @{profile.username}
              </Typography>
            </Stack>
            {sendError && (
              <Typography variant="body2" color="error">
                {sendError}
              </Typography>
            )}
          </Stack>
        )}

        {outgoing?.status === 'pending' && (
          <Stack spacing={2} alignItems="center" sx={{ pt: 1 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Waiting for {outgoing.peerProfile.displayName ?? outgoing.peerProfile.username} to accept…
            </Typography>
          </Stack>
        )}

        {outgoing?.status === 'declined' && (
          <Typography variant="body2" color="error" textAlign="center" sx={{ pt: 1 }}>
            {outgoing.peerProfile.displayName ?? outgoing.peerProfile.username} declined the request.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} color="inherit">
          {outgoing?.status === 'pending' ? 'Cancel' : 'Close'}
        </Button>
        {profile && !outgoing && (
          <Button variant="contained" onClick={() => void send()}>
            Send request
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
