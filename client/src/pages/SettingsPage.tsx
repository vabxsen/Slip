import { Grid } from '@mui/material';
import { AboutSection } from '@/features/settings/components/AboutSection';
import { AppearanceSection } from '@/features/settings/components/AppearanceSection';
import { DeviceSection } from '@/features/settings/components/DeviceSection';
import { InstallApkSection } from '@/features/settings/components/InstallApkSection';
import { InstallAppSection } from '@/features/settings/components/InstallAppSection';
import { NotificationsSection } from '@/features/settings/components/NotificationsSection';
import { PersonalInfoSection } from '@/features/settings/components/PersonalInfoSection';
import { TransferSettingsSection } from '@/features/settings/components/TransferSettingsSection';
import { AccountSection } from '@/features/auth/components/AccountSection';
import { PageTransition } from '@/components/PageTransition';
import { usePageTitle } from '@/hooks/usePageTitle';

export function SettingsPage() {
  usePageTitle('Settings');

  return (
    <PageTransition>
      <Grid container spacing={2.5} sx={{ maxWidth: 960, mx: 'auto' }}>
        <Grid size={12}>
          <AccountSection />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PersonalInfoSection />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <AppearanceSection />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DeviceSection />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TransferSettingsSection />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <NotificationsSection />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InstallAppSection />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InstallApkSection />
        </Grid>
        <Grid size={12}>
          <AboutSection />
        </Grid>
      </Grid>
    </PageTransition>
  );
}
