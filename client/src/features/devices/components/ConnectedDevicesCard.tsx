import DevicesOtherRoundedIcon from '@mui/icons-material/DevicesOtherRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { Avatar, Box, Chip, IconButton, List, ListItem, ListItemAvatar, ListItemText, Stack, Tooltip } from '@mui/material';
import { EmptyState } from '@/components/EmptyState';
import { SectionCard } from '@/components/SectionCard';
import { useConnectionStore, type ConnectionQuality } from '@/store/connectionStore';
import { useSettingsStore } from '@/store/settingsStore';
import { DeviceTypeIcon } from './DeviceTypeIcon';

const QUALITY_COLOR: Record<ConnectionQuality, string> = {
  excellent: 'success.main',
  good: 'warning.main',
  poor: 'error.main',
  unknown: 'text.disabled',
};

const QUALITY_LABEL: Record<ConnectionQuality, string> = {
  excellent: 'Excellent connection',
  good: 'Good connection',
  poor: 'Poor connection',
  unknown: 'Connecting…',
};

export function ConnectedDevicesCard() {
  const peers = useConnectionStore((state) => state.peers);
  const trustedDevices = useSettingsStore((state) => state.trustedDevices);
  const trustDevice = useSettingsStore((state) => state.trustDevice);
  const untrustDevice = useSettingsStore((state) => state.untrustDevice);

  return (
    <SectionCard title="Connected devices">
      {peers.length === 0 ? (
        <EmptyState
          icon={<DevicesOtherRoundedIcon />}
          title="No devices connected"
          description="Scan the QR code or enter the pair code on another device to connect."
        />
      ) : (
        <List disablePadding>
          {peers.map((peer) => {
            const trusted = trustedDevices.some((d) => d.id === peer.id);
            return (
              <ListItem
                key={peer.id}
                disableGutters
                secondaryAction={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Tooltip title={trusted ? 'Trusted — click to remove' : 'Mark as trusted device'}>
                      <IconButton
                        size="small"
                        aria-label={trusted ? `Remove trust for ${peer.name}` : `Trust ${peer.name}`}
                        onClick={() =>
                          trusted ? untrustDevice(peer.id) : trustDevice({ id: peer.id, name: peer.name })
                        }
                      >
                        {trusted ? (
                          <ShieldRoundedIcon fontSize="small" color="primary" />
                        ) : (
                          <ShieldOutlinedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Chip label="Online" color="success" size="small" />
                  </Stack>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'm3.secondaryContainer', color: 'm3.onSecondaryContainer' }}>
                    <DeviceTypeIcon type={peer.type} fontSize="small" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={peer.name}
                  secondary={
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '999px',
                          bgcolor: QUALITY_COLOR[peer.quality],
                        }}
                      />
                      {`${peer.platform} — ${QUALITY_LABEL[peer.quality]}`}
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </SectionCard>
  );
}
