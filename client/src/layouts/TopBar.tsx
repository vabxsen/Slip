import { AppBar, Toolbar, Box } from '@mui/material';
import { Link } from 'react-router';
import { ROUTES } from '@/app/router/paths';
import { BrandLogo } from '@/components/BrandLogo';
import { AccountMenu } from '@/features/auth/components/AccountMenu';

export function TopBar() {
  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: 2 }}>
        <Box
          component={Link}
          to={ROUTES.home}
          sx={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}
        >
          <BrandLogo />
        </Box>
        <Box sx={{ flex: 1 }} />
        <AccountMenu />
      </Toolbar>
    </AppBar>
  );
}
