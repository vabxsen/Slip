import { Stack, Typography } from '@mui/material';
import { ConnectedDevicesCard } from '@/features/devices/components/ConnectedDevicesCard';
import { PageTransition } from '@/components/PageTransition';
import { usePageTitle } from '@/hooks/usePageTitle';

export function DevicesPage() {
  usePageTitle('Your Devices');

  return (
    <PageTransition>
      <Stack spacing={2.5} sx={{ maxWidth: 720, mx: 'auto' }}>
        <Typography variant="h5" component="h1" fontWeight={500}>
          Your Devices
        </Typography>
        <ConnectedDevicesCard />
      </Stack>
    </PageTransition>
  );
}
