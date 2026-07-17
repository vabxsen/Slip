import { BottomNavigation, BottomNavigationAction, Box, Paper } from '@mui/material';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router';
import { NAV_ITEMS } from './navItems';

interface IconPillProps {
  active: boolean;
  children: React.ReactNode;
}

/** M3 active indicator: a small pill behind the icon, with a tap-squish + activation pop. */
function IconPill({ active, children }: IconPillProps) {
  return (
    <Box
      sx={{
        width: 56,
        height: 30,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '999px',
        mb: 0.5,
        backgroundColor: active ? 'm3.secondaryContainer' : 'transparent',
        color: active ? 'm3.onSecondaryContainer' : 'inherit',
        transition: 'background-color 0.2s',
      }}
    >
      <motion.div
        whileTap={{ scale: 0.72, rotate: -10 }}
        animate={active ? { scale: [1, 1.35, 0.95, 1.1, 1], rotate: [0, -12, 10, -4, 0] } : { scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 14 }}
        style={{ display: 'grid', placeItems: 'center' }}
      >
        {children}
      </motion.div>
    </Box>
  );
}

/** M3 bottom navigation — mobile only. */
export function BottomNavBar() {
  const { pathname } = useLocation();

  return (
    <Paper
      elevation={3}
      square
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 'appBar',
        pb: 'env(safe-area-inset-bottom)',
        backgroundColor: 'm3.surfaceContainer',
      }}
    >
      <BottomNavigation
        component="nav"
        aria-label="Main navigation"
        value={pathname}
        showLabels
        sx={{
          height: 72,
          backgroundColor: 'transparent',
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            fontWeight: 500,
            '&.Mui-selected': { fontSize: '0.75rem', fontWeight: 600 },
          },
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          const Icon = active ? item.ActiveIcon : item.Icon;
          return (
            <BottomNavigationAction
              key={item.to}
              component={Link}
              to={item.to}
              value={item.to}
              label={item.label}
              icon={
                <IconPill active={active}>
                  <Icon sx={{ fontSize: 22 }} />
                </IconPill>
              }
              sx={{ color: 'm3.onSurfaceVariant', '&.Mui-selected': { color: 'text.primary' } }}
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
}
