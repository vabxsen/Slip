import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { Snackbar, Stack } from '@mui/material';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useToastStore, type ToastSeverity } from '@/store/toastStore';

const SEVERITY_ICON: Record<ToastSeverity, typeof InfoRoundedIcon> = {
  info: InfoRoundedIcon,
  success: CheckCircleRoundedIcon,
  warning: WarningRoundedIcon,
  error: ErrorRoundedIcon,
};

const SEVERITY_COLOR: Record<ToastSeverity, string> = {
  info: 'm3.inversePrimary',
  success: 'success.light',
  warning: 'warning.light',
  error: 'error.light',
};

/** Renders queued toasts one at a time as M3-styled snackbars. */
export function ToastHost() {
  const isDesktop = useIsDesktop();
  const toast = useToastStore((state) => state.queue[0]);
  const dismiss = useToastStore((state) => state.dismiss);

  if (!toast) return null;

  const Icon = SEVERITY_ICON[toast.severity];

  return (
    <Snackbar
      key={toast.id}
      open
      autoHideDuration={4000}
      onClose={(_, reason) => {
        if (reason !== 'clickaway') dismiss(toast.id);
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: isDesktop ? 'left' : 'center' }}
      sx={{ bottom: { xs: 'calc(92px + env(safe-area-inset-bottom))', md: 24 } }}
      message={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Icon fontSize="small" sx={{ color: SEVERITY_COLOR[toast.severity] }} />
          {toast.message}
        </Stack>
      }
    />
  );
}
