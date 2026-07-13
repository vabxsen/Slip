import { Button, Chip, Stack, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'motion/react';
import { formatBytes } from '@/utils/formatBytes';
import { useTransferStore } from '../store/transferStore';

/** Chips for files staged to send, with per-file remove and clear-all. */
export function StagedFilesList() {
  const staged = useTransferStore((state) => state.staged);
  const unstageFile = useTransferStore((state) => state.unstageFile);
  const clearStaged = useTransferStore((state) => state.clearStaged);

  if (staged.length === 0) return null;

  return (
    <Stack spacing={1.5} sx={{ mt: 2 }} onClick={(e) => e.stopPropagation()}>
      <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
        <AnimatePresence initial={false}>
          {staged.map(({ id, file }) => (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
            >
              <Chip
                label={`${file.name} · ${formatBytes(file.size)}`}
                onDelete={() => unstageFile(id)}
                sx={{ maxWidth: 260 }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </Stack>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Button size="small" onClick={clearStaged}>
          Clear all
        </Button>
        <Typography variant="caption" color="text.secondary">
          Connect a device to send {staged.length === 1 ? 'this file' : 'these files'}.
        </Typography>
      </Stack>
    </Stack>
  );
}
