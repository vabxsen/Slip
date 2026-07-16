import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { Button, Stack, Typography } from '@mui/material';
import { SectionCard } from '@/components/SectionCard';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { showToast } from '@/store/toastStore';

export function InstallAppSection() {
  const { canInstall, installed, promptInstall } = useInstallPrompt();

  if (installed) return null;

  const handleInstall = async () => {
    try {
      await promptInstall();
    } catch {
      showToast('Could not open the install prompt', 'error');
    }
  };

  return (
    <SectionCard title="Install app">
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          {canInstall
            ? 'Install Slip on this device for quick access and a full-screen experience.'
            : "Your browser hasn't offered an install prompt yet — look for an install icon in the address bar, or check the browser menu for \"Install app\" / \"Add to Home Screen\"."}
        </Typography>
        {canInstall && (
          <Button
            variant="outlined"
            startIcon={<DownloadRoundedIcon fontSize="small" />}
            onClick={() => void handleInstall()}
            sx={{ alignSelf: 'flex-start' }}
          >
            Install app
          </Button>
        )}
      </Stack>
    </SectionCard>
  );
}
