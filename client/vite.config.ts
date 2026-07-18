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
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Slip',
        short_name: 'Slip',
        description: 'The easiest way to transfer files between any device.',
        theme_color: '#0b57d0',
        // Native launch-splash background (icon + this color, shown by the
        // OS before any of our JS runs). Pitch black by design — see
        // index.html's inline preboot loader for the matching in-page look.
        background_color: '#000000',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: '/icons/icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // App-shell precache; offline navigations fall back to the cached SPA shell.
        navigateFallback: '/index.html',
        // Firebase Hosting reserves /__/** for its own auth-handler and SDK-config
        // endpoints — without this, the SW's SPA fallback swallows those
        // navigations and serves our 404 page instead of Firebase's real response,
        // silently breaking signInWithRedirect.
        navigateFallbackDenylist: [/^\/__\//],
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Split large, rarely-changing vendor code into its own cacheable
        // chunk so app updates don't force users to re-download React/MUI.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
  },
});
