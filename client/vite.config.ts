import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      // Manifest and icons are finalized in the PWA polish phase.
      manifest: {
        name: 'Slip',
        short_name: 'Slip',
        description: 'The easiest way to transfer files between any device.',
        theme_color: '#0b57d0',
        background_color: '#f9f9ff',
        display: 'standalone',
        start_url: '/',
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
});
