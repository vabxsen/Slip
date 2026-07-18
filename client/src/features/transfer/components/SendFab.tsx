import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { Fab } from '@mui/material';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { PageFab } from '@/layouts/FabSlot';
import { useIsDesktop } from '@/hooks/useIsDesktop';
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
    // Just paired via QR/code — jump straight into picking files to send,
    // skipping the extra tap on this button. Browsers only honor
    // input.click() with a fresh-enough user gesture behind it; if the
    // pairing round-trip + navigation ate that window, this silently
    // no-ops and the button is still right here to tap manually.
    openPicker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenPicker]);

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
    </PageFab>
  );
}
