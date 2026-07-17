import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.slip.app',
  appName: 'Slip',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
