import { Box, Stack, Typography } from '@mui/material';
import { useDeviceStore } from '@/store/deviceStore';
import { DeviceTypeIcon } from './DeviceTypeIcon';

/** "This device" banner: friendly name, platform, and type icon. */
export function DeviceIdentityHeader() {
  const device = useDeviceStore((state) => state.device);

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '16px',
          display: 'grid',
          placeItems: 'center',
          backgroundColor: 'm3.primaryContainer',
          color: 'm3.onPrimaryContainer',
        }}
      >
        <DeviceTypeIcon type={device.type} />
      </Box>
      <Stack>
        <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4 }}>
          This device
        </Typography>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 500 }}>
          {device.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {device.platform}
        </Typography>
      </Stack>
    </Stack>
  );
}
