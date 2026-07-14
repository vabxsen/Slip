import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { formatBytes } from '@/utils/formatBytes';
import { shouldPromptForFolder } from '../services/receiveEngine';
import { acceptIncoming, declineIncoming } from '../services/transferActions';
import { useIncomingRequestStore } from '../store/incomingRequestStore';

/** Accept/decline prompt for an inbound file batch; always mounted, self-hides. */
export function IncomingTransferDialog() {
  const request = useIncomingRequestStore((state) => state.request);
  if (!request) return null;

  const offerFolderChoice = shouldPromptForFolder();

  const totalSize = request.files.reduce((sum, f) => sum + f.size, 0);

  return (
    <Dialog open onClose={declineIncoming} maxWidth="xs" fullWidth>
      <DialogTitle>
        {request.peerName} wants to send {request.files.length === 1 ? 'a file' : `${request.files.length} files`}
      </DialogTitle>
      <DialogContent>
        <List dense disablePadding sx={{ maxHeight: 240, overflowY: 'auto' }}>
          {request.files.map((file) => (
            <ListItem key={file.id} disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <InsertDriveFileOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={file.name} secondary={formatBytes(file.size)} primaryTypographyProps={{ noWrap: true }} />
            </ListItem>
          ))}
        </List>
        <Typography variant="caption" color="text.secondary">
          Total: {formatBytes(totalSize)}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
        <Button
          variant="contained"
          onClick={() => acceptIncoming(offerFolderChoice)}
          startIcon={<FolderOpenRoundedIcon />}
        >
          {offerFolderChoice ? 'Accept & choose folder' : 'Accept'}
        </Button>
        <Button onClick={declineIncoming} color="inherit">
          Decline
        </Button>
      </DialogActions>
    </Dialog>
  );
}
