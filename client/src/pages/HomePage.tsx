import { Grid } from '@mui/material';
import { motion, type Variants } from 'motion/react';
import { ConnectedDevicesCard } from '@/features/devices/components/ConnectedDevicesCard';
import { DeviceIdentityHeader } from '@/features/devices/components/DeviceIdentityHeader';
import { RecentTransfersCard } from '@/features/history/components/RecentTransfersCard';
import { PairCard } from '@/features/pairing/components/PairCard';
import { ActiveTransfersCard } from '@/features/transfer/components/ActiveTransfersCard';
import { DropZone } from '@/features/transfer/components/DropZone';
import { IncomingTransferDialog } from '@/features/transfer/components/IncomingTransferDialog';
import { SendFab } from '@/features/transfer/components/SendFab';
import { usePageTitle } from '@/hooks/usePageTitle';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export function HomePage() {
  usePageTitle('Home');

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <Grid container spacing={2.5}>
        <Grid size={12}>
          <motion.div variants={item}>
            <DeviceIdentityHeader />
          </motion.div>
        </Grid>
        <Grid size={12}>
          <motion.div variants={item}>
            <ActiveTransfersCard />
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <motion.div variants={item} style={{ height: '100%' }}>
            <PairCard />
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <motion.div variants={item} style={{ height: '100%' }}>
            <DropZone />
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div variants={item} style={{ height: '100%' }}>
            <ConnectedDevicesCard />
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div variants={item} style={{ height: '100%' }}>
            <RecentTransfersCard />
          </motion.div>
        </Grid>
      </Grid>
      <SendFab />
      <IncomingTransferDialog />
    </motion.div>
  );
}
