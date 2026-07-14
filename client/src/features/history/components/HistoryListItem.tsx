import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import { Box, Chip, ListItem, ListItemAvatar, ListItemText, Stack, Typography } from '@mui/material';
import { formatBytes } from '@/utils/formatBytes';
import { formatDateTime } from '@/utils/formatDate';
import type { HistoryRecord, HistoryStatus } from '../types';
import { formatDuration } from '@/features/transfer/utils/formatDuration';

const STATUS_CHIP: Record<HistoryStatus, { label: string; color: 'success' | 'error' | 'default' }> = {
  completed: { label: 'Completed', color: 'success' },
  failed: { label: 'Failed', color: 'error' },
  cancelled: { label: 'Cancelled', color: 'default' },
};

interface HistoryListItemProps {
  record: HistoryRecord;
}

export function HistoryListItem({ record }: HistoryListItemProps) {
  const chip = STATUS_CHIP[record.status];

  return (
    <ListItem
      disableGutters
      sx={{
        borderRadius: '12px',
        px: 1.5,
        '&:hover': { backgroundColor: 'action.hover' },
      }}
      secondaryAction={<Chip label={chip.label} color={chip.color} size="small" />}
    >
      <ListItemAvatar>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            display: 'grid',
            placeItems: 'center',
            backgroundColor: 'm3.secondaryContainer',
            color: 'm3.onSecondaryContainer',
            position: 'relative',
          }}
        >
          {record.status === 'completed' ? (
            <CheckCircleRoundedIcon fontSize="small" />
          ) : record.status === 'failed' ? (
            <ErrorRoundedIcon fontSize="small" />
          ) : (
            <CancelRoundedIcon fontSize="small" />
          )}
          <Box
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              backgroundColor: 'background.paper',
              borderRadius: '999px',
              display: 'grid',
              placeItems: 'center',
              width: 18,
              height: 18,
            }}
          >
            {record.direction === 'send' ? (
              <UploadRoundedIcon sx={{ fontSize: 13 }} />
            ) : (
              <DownloadRoundedIcon sx={{ fontSize: 13 }} />
            )}
          </Box>
        </Box>
      </ListItemAvatar>
      <ListItemText
        sx={{ pr: 12 }}
        primary={
          <Stack direction="row" spacing={0.75} alignItems="center">
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant="body2" noWrap fontWeight={500} title={record.name}>
              {record.name}
            </Typography>
          </Stack>
        }
        secondary={
          <Box component="span" sx={{ display: 'block' }}>
            <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
              {record.direction === 'send' ? 'Sent to' : 'Received from'} {record.peerName} · {formatBytes(record.size)}
            </Typography>
            <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
              {formatDateTime(record.completedAt)} · {formatDuration(record.durationMs / 1000)}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
}
