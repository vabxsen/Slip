import { Stack } from '@mui/material';
import { AboutSection } from '@/features/settings/components/AboutSection';
import { AppearanceSection } from '@/features/settings/components/AppearanceSection';
import { DeviceSection } from '@/features/settings/components/DeviceSection';
import { NotificationsSection } from '@/features/settings/components/NotificationsSection';
import { TransferSettingsSection } from '@/features/settings/components/TransferSettingsSection';
import { PageTransition } from '@/components/PageTransition';
import { usePageTitle } from '@/hooks/usePageTitle';

export function SettingsPage() {
  usePageTitle('Settings');

  return (
    <PageTransition>
      <Stack spacing={2.5} sx={{ maxWidth: 640, mx: 'auto' }}>
        <AppearanceSection />
        <DeviceSection />
        <TransferSettingsSection />
        <NotificationsSection />
        <AboutSection />
      </Stack>
    </PageTransition>
  );
}
