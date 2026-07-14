import { Stack } from '@mui/material';
import { AnimatePresence, motion } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import { SectionCard } from '@/components/SectionCard';
import { selectActiveTransfers, useActiveTransfersStore } from '../store/activeTransfersStore';
import { TransferCard } from './TransferCard';

/** Renders nothing when idle — mounted unconditionally on Home. */
export function ActiveTransfersCard() {
  // selectActiveTransfers derives a fresh array each call; useShallow keeps
  // the render stable by comparing contents instead of reference identity.
  const records = useActiveTransfersStore(useShallow(selectActiveTransfers));
  if (records.length === 0) return null;

  return (
    <SectionCard title={`Transferring (${records.length})`}>
      <Stack spacing={1.25}>
        <AnimatePresence initial={false}>
          {records.map((record) => (
            <motion.div
              key={record.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TransferCard record={record} />
            </motion.div>
          ))}
        </AnimatePresence>
      </Stack>
    </SectionCard>
  );
}
