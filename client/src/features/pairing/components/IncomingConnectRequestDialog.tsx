import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useDeviceStore } from '@/store/deviceStore';
import { respondToConnect } from '../services/connectRequestClient';
import { useConnectRequestStore } from '../store/connectRequestStore';

/** Accept/decline prompt for an inbound username-initiated connection request; always mounted, self-hides. */
export function IncomingConnectRequestDialog() {
  const incoming = useConnectRequestStore((state) => state.incoming);
  const setIncoming = useConnectRequestStore((state) => state.setIncoming);
  const device = useDeviceStore((state) => state.device);
  if (!incoming) return null;

  const respond = (accept: boolean) => {
    respondToConnect(incoming.requestId, accept, device);
    setIncoming(null);
  };

  return (
    <Dialog open onClose={() => respond(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Connection request</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 48, height: 48 }}>{(incoming.fromDisplayName ?? incoming.fromUsername).charAt(0).toUpperCase()}</Avatar>
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>
              {incoming.fromDisplayName ?? incoming.fromUsername}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              @{incoming.fromUsername} wants to connect
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
        <Button variant="contained" onClick={() => respond(true)}>
          Accept
        </Button>
        <Button onClick={() => respond(false)} color="inherit">
          Decline
        </Button>
      </DialogActions>
    </Dialog>
  );
}
