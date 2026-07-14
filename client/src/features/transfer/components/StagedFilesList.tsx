import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { Button, Chip, Stack, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'motion/react';
import type { MouseEvent } from 'react';
import { useConnectionStore } from '@/store/connectionStore';
import { formatBytes } from '@/utils/formatBytes';
import { sendFiles } from '../services/transferActions';
import { useTransferStore } from '../store/transferStore';

/** Chips for files staged to send, plus a Send action once a peer is ready. */
export function StagedFilesList() {
  const staged = useTransferStore((state) => state.staged);
  const unstageFile = useTransferStore((state) => state.unstageFile);
  const clearStaged = useTransferStore((state) => state.clearStaged);
  const peer = useConnectionStore((state) => state.peers[0]);
  const dataChannelReady = useConnectionStore((state) => state.dataChannelReady);

  if (staged.length === 0) return null;

  const canSend = Boolean(peer) && dataChannelReady;

  const handleSend = () => {
    if (!peer) return;
    sendFiles(staged, peer.name);
    clearStaged();
  };

  return (
    <Stack spacing={1.5} sx={{ mt: 2 }} onClick={(e: MouseEvent) => e.stopPropagation()}>
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
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
        {canSend && peer ? (
          <Button size="small" variant="contained" startIcon={<SendRoundedIcon />} onClick={handleSend}>
            Send to {peer.name}
          </Button>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Connect a device to send {staged.length === 1 ? 'this file' : 'these files'}.
          </Typography>
        )}
        <Button size="small" onClick={clearStaged}>
          Clear all
        </Button>
      </Stack>
    </Stack>
  );
}
