import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import { Box, IconButton, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import { formatBytes } from '@/utils/formatBytes';
import { cancelTransfer, retryTransfer } from '../services/transferActions';
import type { TransferRecord } from '../store/activeTransfersStore';
import { formatDuration } from '../utils/formatDuration';

const STATUS_LABEL: Record<TransferRecord['status'], string> = {
  pending: 'Waiting…',
  accepted: 'Starting…',
  transferring: 'Transferring',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
};

interface TransferCardProps {
  record: TransferRecord;
}

export function TransferCard({ record }: TransferCardProps) {
  const progress = record.size > 0 ? Math.min(100, (record.bytesTransferred / record.size) * 100) : 100;
  const remaining = Math.max(record.size - record.bytesTransferred, 0);
  const eta = record.speedBps > 0 ? remaining / record.speedBps : Infinity;
  const isActive = record.status === 'pending' || record.status === 'accepted' || record.status === 'transferring';
  const canRetry = record.status === 'cancelled' || record.status === 'failed';

  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: '12px',
        backgroundColor: 'm3.surfaceContainerHighest',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: '10px',
          display: 'grid',
          placeItems: 'center',
          backgroundColor: 'm3.secondaryContainer',
          color: 'm3.onSecondaryContainer',
          position: 'relative',
        }}
      >
        <InsertDriveFileOutlinedIcon fontSize="small" />
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

      <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" noWrap sx={{ flex: 1, fontWeight: 500 }} title={record.name}>
            {record.name}
          </Typography>
          {record.status === 'completed' && <CheckCircleRoundedIcon fontSize="small" color="success" />}
          {record.status === 'failed' && <ErrorRoundedIcon fontSize="small" color="error" />}
        </Stack>

        {isActive ? (
          <>
            <LinearProgress variant="determinate" value={progress} />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                {formatBytes(record.bytesTransferred)} / {formatBytes(record.size)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {record.speedBps > 0
                  ? `${formatBytes(record.speedBps)}/s · ${formatDuration(eta)} left`
                  : STATUS_LABEL[record.status]}
              </Typography>
            </Stack>
          </>
        ) : (
          <Typography variant="caption" color={record.status === 'failed' ? 'error' : 'text.secondary'}>
            {record.status === 'failed' && record.errorMessage ? record.errorMessage : STATUS_LABEL[record.status]}
            {' · '}
            {formatBytes(record.size)}
          </Typography>
        )}
      </Stack>

      {isActive && (
        <Tooltip title="Cancel">
          <IconButton size="small" aria-label={`Cancel ${record.name}`} onClick={() => cancelTransfer(record.id)}>
            <CancelRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {canRetry && (
        <Tooltip title="Retry">
          <IconButton size="small" aria-label={`Retry ${record.name}`} onClick={() => retryTransfer(record.id)}>
            <ReplayRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
