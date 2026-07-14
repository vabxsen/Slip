import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded';
import { Box, Stack, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'motion/react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/** Slim persistent banner shown while the browser has no network connection. */
export function OfflineBanner() {
  const online = useOnlineStatus();

  return (
    <AnimatePresence initial={false}>
      {!online && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ overflow: 'hidden' }}
        >
          <Box sx={{ backgroundColor: 'm3.errorContainer', color: 'm3.onErrorContainer', py: 0.75 }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
              <WifiOffRoundedIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" fontWeight={500}>
                You&apos;re offline — pairing and transfers need a connection.
              </Typography>
            </Stack>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
