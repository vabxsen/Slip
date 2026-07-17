import AndroidRoundedIcon from '@mui/icons-material/AndroidRounded';
import { Button, Stack, Typography } from '@mui/material';
import { Capacitor } from '@capacitor/core';
import { SectionCard } from '@/components/SectionCard';
import { ANDROID_APK_URL } from '@/utils/env';

/** Links to the CI-built Android APK. Hidden once already running inside that installed app. */
export function InstallApkSection() {
  if (Capacitor.isNativePlatform()) return null;

  return (
    <SectionCard title="Install Android app">
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          Get Slip as an Android app with nearby Bluetooth/Wi-Fi Direct sharing. This is a
          debug build for sideloading, not a Play Store release — you&apos;ll need to allow
          &quot;install from unknown sources&quot; for your browser when opening it.
        </Typography>
        <Button
          variant="outlined"
          href={ANDROID_APK_URL}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<AndroidRoundedIcon fontSize="small" />}
          sx={{ alignSelf: 'flex-start' }}
        >
          Download APK
        </Button>
      </Stack>
    </SectionCard>
  );
}
