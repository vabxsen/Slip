import SendRoundedIcon from '@mui/icons-material/SendRounded';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  Stack,
  Typography,
} from '@mui/material';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { PageFab } from '@/layouts/FabSlot';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useConnectionStore } from '@/store/connectionStore';
import { showToast } from '@/store/toastStore';
import { formatBytes } from '@/utils/formatBytes';
import { useFilePicker } from '../hooks/useFilePicker';
import { sendFiles } from '../services/transferActions';
import { useTransferStore, type StagedFile } from '../store/transferStore';
import type { TraversedFile } from '../utils/directoryEntries';

/** Home's floating action button: pick files to send. */
export function SendFab() {
  const isDesktop = useIsDesktop();
  const stageFiles = useTransferStore((state) => state.stageFiles);
  const clearStaged = useTransferStore((state) => state.clearStaged);
  const autoOpenPicker = useTransferStore((state) => state.autoOpenPicker);
  const clearAutoOpenPicker = useTransferStore((state) => state.clearAutoOpenPicker);
  const peers = useConnectionStore((state) => state.peers);
  const dataChannelReady = useConnectionStore((state) => state.dataChannelReady);
  const [showConnectedPrompt, setShowConnectedPrompt] = useState(false);
  const [pendingSend, setPendingSend] = useState<StagedFile[] | null>(null);

  const activePeer = [...peers].sort((a, b) => b.connectedAt - a.connectedAt)[0];

  const handleFiles = (files: TraversedFile[]) => {
    stageFiles(files);
    const allStaged = useTransferStore.getState().staged;
    if (activePeer && dataChannelReady) {
      // A device is already connected — confirm before sending instead of
      // just leaving the files sitting staged with an easy-to-miss button.
      setPendingSend(allStaged);
    } else {
      showToast(
        files.length === 1 ? `Added ${files[0]?.file.name}` : `Added ${files.length} files`,
        'success',
      );
    }
  };

  const { openPicker, input } = useFilePicker(handleFiles);

  useEffect(() => {
    if (!autoOpenPicker) return;
    clearAutoOpenPicker();
    // Just paired via QR/code — show an in-app prompt rather than jumping
    // straight to the native file manager, so the user isn't surprised by
    // an OS picker appearing right after pairing with no context.
    setShowConnectedPrompt(true);
  }, [autoOpenPicker, clearAutoOpenPicker]);

  // If the peer drops while the send-confirmation dialog is open, don't
  // leave a dead "Send" button behind.
  useEffect(() => {
    if (!activePeer || !dataChannelReady) setPendingSend(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePeer?.id, dataChannelReady]);

  const handleChooseFiles = () => {
    setShowConnectedPrompt(false);
    openPicker();
  };

  const cancelSend = () => setPendingSend(null);

  const confirmSend = () => {
    if (!pendingSend || !activePeer) return;
    sendFiles(pendingSend, activePeer.name);
    clearStaged();
    setPendingSend(null);
  };

  return (
    <PageFab>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28, delay: 0.15 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        <Fab
          variant={isDesktop ? 'extended' : 'circular'}
          aria-label="Send files"
          onClick={openPicker}
          sx={{ gap: 1 }}
        >
          <SendRoundedIcon />
          {isDesktop && 'Send files'}
        </Fab>
      </motion.div>
      {input}
      <Dialog open={showConnectedPrompt} onClose={() => setShowConnectedPrompt(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Connected{activePeer ? ` to ${activePeer.name}` : ''}</DialogTitle>
        <DialogContent>
          <DialogContentText>Choose the files you&apos;d like to send.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowConnectedPrompt(false)} color="inherit">
            Not now
          </Button>
          <Button variant="contained" onClick={handleChooseFiles}>
            Choose files
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(pendingSend)} onClose={cancelSend} maxWidth="xs" fullWidth>
        <DialogTitle>
          Send {pendingSend && pendingSend.length === 1 ? pendingSend[0]?.file.name : `${pendingSend?.length ?? 0} files`}?
        </DialogTitle>
        <DialogContent>
          <Stack spacing={0.5} sx={{ mb: 1.5, maxHeight: 200, overflowY: 'auto' }}>
            {pendingSend?.map(({ id, file }) => (
              <Typography key={id} variant="body2" color="text.secondary" noWrap>
                {file.name} · {formatBytes(file.size)}
              </Typography>
            ))}
          </Stack>
          <DialogContentText>Send to {activePeer?.name}?</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={cancelSend} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" startIcon={<SendRoundedIcon />} onClick={confirmSend}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </PageFab>
  );
}
