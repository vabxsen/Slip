import { AppBar, Toolbar, Box } from '@mui/material';
import { Link } from 'react-router';
import { ROUTES } from '@/app/router/paths';
import { BrandLogo } from '@/components/BrandLogo';

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
      </Toolbar>
    </AppBar>
  );
}
