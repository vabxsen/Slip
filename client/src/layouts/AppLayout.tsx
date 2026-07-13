import { Box } from '@mui/material';
import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { FullPageLoader } from '@/components/FullPageLoader';
import { ToastHost } from '@/components/ToastHost';
import { useConnectionListeners } from '@/features/pairing/hooks/useConnectionListeners';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { BottomNavBar } from './BottomNavBar';
import { FabSlotHost, FabSlotProvider } from './FabSlot';
import { NavigationRail } from './NavigationRail';
import { TopBar } from './TopBar';

/**
 * Responsive M3 app shell: top app bar everywhere, navigation rail on
 * desktop, bottom navigation on mobile, plus the FAB anchor and toast host.
 */
export function AppLayout() {
  const isDesktop = useIsDesktop();
  useConnectionListeners();

  return (
    <FabSlotProvider>
      <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <Box sx={{ display: 'flex', flex: 1, alignItems: 'stretch' }}>
          {isDesktop && <NavigationRail />}
          <Box
            component="main"
            sx={{
              flex: 1,
              minWidth: 0,
              width: '100%',
              maxWidth: 1080,
              mx: 'auto',
              px: { xs: 2, sm: 3 },
              pt: { xs: 2, md: 3 },
              pb: { xs: 'calc(96px + env(safe-area-inset-bottom))', md: 4 },
            }}
          >
            <Suspense fallback={<FullPageLoader />}>
              <Outlet />
            </Suspense>
          </Box>
        </Box>
        {!isDesktop && <BottomNavBar />}
        <FabSlotHost />
        <ToastHost />
      </Box>
    </FabSlotProvider>
  );
}
