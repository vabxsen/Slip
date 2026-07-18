import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab } from '@mui/material';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { PageFab } from '@/layouts/FabSlot';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useConnectionStore } from '@/store/connectionStore';
import { showToast } from '@/store/toastStore';
import { useFilePicker } from '../hooks/useFilePicker';
import { useTransferStore } from '../store/transferStore';
import type { TraversedFile } from '../utils/directoryEntries';

/** Home's floating action button: pick files to send. */
export function SendFab() {
  const isDesktop = useIsDesktop();
  const stageFiles = useTransferStore((state) => state.stageFiles);
  const autoOpenPicker = useTransferStore((state) => state.autoOpenPicker);
  const clearAutoOpenPicker = useTransferStore((state) => state.clearAutoOpenPicker);
  const peers = useConnectionStore((state) => state.peers);
  const [showConnectedPrompt, setShowConnectedPrompt] = useState(false);

  const handleFiles = (files: TraversedFile[]) => {
    stageFiles(files);
    showToast(
      files.length === 1 ? `Added ${files[0]?.file.name}` : `Added ${files.length} files`,
      'success',
    );
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

  const latestPeerName = [...peers].sort((a, b) => b.connectedAt - a.connectedAt)[0]?.name;

  const handleChooseFiles = () => {
    setShowConnectedPrompt(false);
    openPicker();
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
        <DialogTitle>Connected{latestPeerName ? ` to ${latestPeerName}` : ''}</DialogTitle>
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
    </PageFab>
  );
}
