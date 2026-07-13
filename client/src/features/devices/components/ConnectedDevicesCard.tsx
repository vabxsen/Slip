import DevicesOtherRoundedIcon from '@mui/icons-material/DevicesOtherRounded';
import { Avatar, Box, Chip, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { EmptyState } from '@/components/EmptyState';
import { SectionCard } from '@/components/SectionCard';
import { useConnectionStore, type ConnectionQuality } from '@/store/connectionStore';
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
          {peers.map((peer) => (
            <ListItem key={peer.id} disableGutters
              secondaryAction={<Chip label="Online" color="success" size="small" />}
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
          ))}
        </List>
      )}
    </SectionCard>
  );
}
