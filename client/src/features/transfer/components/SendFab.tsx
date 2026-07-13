import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { Fab } from '@mui/material';
import { motion } from 'motion/react';
import { PageFab } from '@/layouts/FabSlot';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { showToast } from '@/store/toastStore';
import { useFilePicker } from '../hooks/useFilePicker';
import { useTransferStore } from '../store/transferStore';

/** Home's floating action button: pick files to send. */
export function SendFab() {
  const isDesktop = useIsDesktop();
  const stageFiles = useTransferStore((state) => state.stageFiles);

  const handleFiles = (files: File[]) => {
    stageFiles(files);
    showToast(
      files.length === 1 ? `Added ${files[0]?.name}` : `Added ${files.length} files`,
      'success',
    );
  };

  const { openPicker, input } = useFilePicker(handleFiles);

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
