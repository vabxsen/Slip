import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { Alert, Button, Chip, Stack, Typography } from '@mui/material';
import { SectionCard } from '@/components/SectionCard';
import { BrandLogo } from '@/components/BrandLogo';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

const APP_VERSION = '0.1.0';

export function AboutSection() {
  const { canInstall, showIosInstructions, installed, promptInstall } = useInstallPrompt();

  return (
    <SectionCard title="About">
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <BrandLogo />
          <Chip label={`v${APP_VERSION}`} size="small" variant="outlined" />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          The easiest way to transfer files between any device. Files move directly, peer-to-peer,
          over an encrypted connection — they never pass through or sit on a server.
        </Typography>
        <Alert icon={<LockRoundedIcon fontSize="small" />} severity="info" sx={{ borderRadius: 3 }}>
          Transfers use WebRTC with DTLS encryption. Only pairing codes and connection setup go
          through the signaling server; file contents never do.
        </Alert>

        {installed ? (
          <Typography variant="caption" color="text.secondary">
            Slip is installed on this device.
          </Typography>
        ) : canInstall ? (
          <Button
            variant="outlined"
            startIcon={<GetAppRoundedIcon fontSize="small" />}
            onClick={() => void promptInstall()}
            sx={{ alignSelf: 'flex-start' }}
          >
            Install Slip
          </Button>
        ) : showIosInstructions ? (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ p: 1.5, borderRadius: 3, backgroundColor: 'm3.surfaceContainerHigh' }}
          >
            <IosShareRoundedIcon fontSize="small" />
            <Typography variant="caption">
              Tap Share, then &quot;Add to Home Screen&quot; to install Slip.
            </Typography>
          </Stack>
        ) : null}
      </Stack>
    </SectionCard>
  );
}
