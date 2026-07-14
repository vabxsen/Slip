import { Divider, Stack, Typography } from '@mui/material';
import { SectionCard } from '@/components/SectionCard';
import { useDeviceStore } from '@/store/deviceStore';
import { DeviceTypeIcon } from '@/features/devices/components/DeviceTypeIcon';
import { DeviceNameForm } from './DeviceNameForm';

export function DeviceSection() {
  const device = useDeviceStore((state) => state.device);

  return (
    <SectionCard title="Device">
      <Stack spacing={2}>
        <DeviceNameForm />
        <Divider />
        <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
          <DeviceTypeIcon type={device.type} fontSize="small" />
          <Typography variant="caption">{device.platform}</Typography>
        </Stack>
      </Stack>
    </SectionCard>
  );
}
