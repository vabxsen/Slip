import { Box, Button, Stack } from '@mui/material';
import { Suspense } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { ROUTES } from '@/app/router/paths';
import { FullPageLoader } from '@/components/FullPageLoader';

const NAV_ITEMS = [
  { label: 'Home', to: ROUTES.home },
  { label: 'Pair', to: ROUTES.pair },
  { label: 'History', to: ROUTES.history },
  { label: 'Settings', to: ROUTES.settings },
] as const;

/**
 * Root app shell. The plain button row below is a temporary navigation aid —
 * Phase 4 replaces this layout with the real AppLayout (top bar + nav rail /
 * bottom navigation).
 */
export function RootLayout() {
  const location = useLocation();

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" spacing={1} justifyContent="center" sx={{ p: 2 }}>
        {NAV_ITEMS.map((item) => (
          <Button
            key={item.to}
            component={Link}
            to={item.to}
            size="small"
            variant={location.pathname === item.to ? 'contained' : 'text'}
            sx={{ borderRadius: 5 }}
          >
            {item.label}
          </Button>
        ))}
      </Stack>
      <Box component="main" sx={{ flex: 1 }}>
        <Suspense fallback={<FullPageLoader />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
