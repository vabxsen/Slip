import { FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { SectionCard } from '@/components/SectionCard';
import {
  notificationsSupported,
  requestNotificationPermission,
} from '@/services/notifications/notifications';
import { useSettingsStore } from '@/store/settingsStore';
import { showToast } from '@/store/toastStore';

export function NotificationsSection() {
  const enabled = useSettingsStore((state) => state.notificationsEnabled);
  const setEnabled = useSettingsStore((state) => state.setNotificationsEnabled);
  const soundEnabled = useSettingsStore((state) => state.soundEffectsEnabled);
  const setSoundEnabled = useSettingsStore((state) => state.setSoundEffectsEnabled);
  const supported = notificationsSupported();

  const handleToggle = async (checked: boolean) => {
    if (!checked) {
      setEnabled(false);
      return;
    }
    const granted = await requestNotificationPermission();
    if (granted) {
      setEnabled(true);
    } else {
      showToast('Notifications were blocked in your browser settings', 'error');
    }
  };

  return (
    <SectionCard title="Notifications">
      <Stack spacing={1.5}>
        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              disabled={!supported}
              onChange={(e) => void handleToggle(e.target.checked)}
            />
          }
          label={
            <Stack>
              <Typography variant="body2">System notifications</Typography>
              <Typography variant="caption" color="text.secondary">
                {supported
                  ? 'Get notified when a device connects or a file finishes downloading, even in another tab'
                  : 'Not supported in this browser'}
              </Typography>
            </Stack>
          }
        />
        <FormControlLabel
          control={
            <Switch checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />
          }
          label={
            <Stack>
              <Typography variant="body2">Sound effects</Typography>
              <Typography variant="caption" color="text.secondary">
                Play a chime when a file finishes sending or downloading
              </Typography>
            </Stack>
          }
        />
      </Stack>
    </SectionCard>
  );
}
