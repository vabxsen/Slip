import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/layouts/RootLayout';
import { FullPageLoader } from '@/components/FullPageLoader';
import { ROUTES } from './paths';

/**
 * Data router with code-split pages: each page chunk is fetched on first
 * navigation, keeping the initial bundle lean as features grow.
 */
export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <RootLayout />,
    HydrateFallback: FullPageLoader,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/pages/HomePage')).HomePage }),
      },
      {
        path: ROUTES.pair,
        lazy: async () => ({ Component: (await import('@/pages/PairPage')).PairPage }),
      },
      {
        path: ROUTES.history,
        lazy: async () => ({ Component: (await import('@/pages/HistoryPage')).HistoryPage }),
      },
      {
        path: ROUTES.settings,
        lazy: async () => ({ Component: (await import('@/pages/SettingsPage')).SettingsPage }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/pages/NotFoundPage')).NotFoundPage }),
      },
    ],
  },
]);
