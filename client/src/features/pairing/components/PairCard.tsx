import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { Box, IconButton, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import QRCode from 'react-qr-code';
import { SectionCard } from '@/components/SectionCard';
import { showToast } from '@/store/toastStore';
import { buildPairUrl, usePairingStore } from '../store/pairingStore';

export function PairCard() {
  const code = usePairingStore((state) => state.code);
  const regenerate = usePairingStore((state) => state.regenerate);

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      showToast('Pair code copied', 'success');
    } catch {
      showToast('Could not copy the code', 'error');
    }
  };

  return (
    <SectionCard
      title="Pair a device"
      action={
        <Tooltip title="New code">
          <IconButton aria-label="Generate a new pair code" onClick={regenerate} size="small">
            <RefreshRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      }
    >
      <Stack spacing={2.5} alignItems="center">
        <Box
          sx={{
            p: 1.75,
            borderRadius: '16px',
            backgroundColor: '#fff',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {code ? (
            <QRCode value={buildPairUrl(code)} size={148} fgColor="#000" bgColor="#fff" />
          ) : (
            <Skeleton variant="rounded" width={148} height={148} />
          )}
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography
            variant="h4"
            component="p"
            aria-label={code ? `Pair code ${code.split('').join(' ')}` : 'Generating pair code'}
            sx={{ letterSpacing: '0.3em', fontWeight: 500, textIndent: '0.3em' }}
          >
            {code ?? '······'}
          </Typography>
          <Tooltip title="Copy code">
            <IconButton aria-label="Copy pair code" onClick={copyCode} size="small">
              <ContentCopyRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Scan the QR code or enter this code on another device to connect.
        </Typography>
      </Stack>
    </SectionCard>
  );
}
