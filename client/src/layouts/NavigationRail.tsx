import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router';
import { NAV_ITEMS, type NavItem } from './navItems';

interface RailItemProps {
  item: NavItem;
  active: boolean;
}

function RailItem({ item, active }: RailItemProps) {
  const Icon = active ? item.ActiveIcon : item.Icon;

  return (
    <ButtonBase
      component={Link}
      to={item.to}
      aria-current={active ? 'page' : undefined}
      sx={{ flexDirection: 'column', gap: 0.5, width: 72, py: 1, borderRadius: '16px' }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 56,
          height: 32,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '999px',
          color: active ? 'm3.onSecondaryContainer' : 'm3.onSurfaceVariant',
          transition: 'color 0.2s',
          '&:hover': { backgroundColor: active ? undefined : 'action.hover' },
        }}
      >
        {active && (
          <motion.span
            layoutId="rail-indicator"
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
              background: 'var(--mui-palette-m3-secondaryContainer)',
            }}
          />
        )}
        <motion.div
          whileTap={{ scale: 0.72, rotate: -10 }}
          animate={active ? { scale: [1, 1.35, 0.95, 1.1, 1], rotate: [0, -12, 10, -4, 0] } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 14 }}
          style={{ position: 'relative', display: 'grid', placeItems: 'center' }}
        >
          <Icon sx={{ fontSize: 22 }} />
        </motion.div>
      </Box>
      <Typography
        variant="caption"
        sx={{
          fontWeight: active ? 600 : 500,
          color: active ? 'text.primary' : 'text.secondary',
        }}
      >
        {item.label}
      </Typography>
    </ButtonBase>
  );
}

/** M3 navigation rail — desktop only. */
export function NavigationRail() {
  const { pathname } = useLocation();

  return (
    <Stack
      component="nav"
      aria-label="Main navigation"
      spacing={0.5}
      sx={{
        width: 88,
        flexShrink: 0,
        alignItems: 'center',
        pt: 2,
        position: 'sticky',
        top: 64,
        alignSelf: 'flex-start',
        height: 'calc(100dvh - 64px)',
      }}
    >
      {NAV_ITEMS.map((item) => (
        <RailItem key={item.to} item={item} active={pathname === item.to} />
      ))}
    </Stack>
  );
}
