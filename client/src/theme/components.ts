import type { Components, Theme } from '@mui/material/styles';
import { radius } from './shape';

/**
 * Material 3 styling for MUI components. Colors are referenced through
 * `theme.vars` so everything responds to light/dark via CSS variables
 * without re-rendering.
 */
export const components: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
    },
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: {
        borderRadius: radius.full,
        minHeight: 40,
        paddingInline: 24,
      },
      outlined: ({ theme }) => ({
        borderColor: (theme.vars ?? theme).palette.m3.outline,
      }),
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: { borderRadius: radius.full, textTransform: 'none' },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { backgroundImage: 'none' },
      rounded: { borderRadius: radius.lg },
    },
  },
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: radius.lg,
        backgroundColor: (theme.vars ?? theme).palette.m3.surfaceContainerLow,
      }),
    },
  },
  MuiAppBar: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: (theme.vars ?? theme).palette.m3.surface,
        color: (theme.vars ?? theme).palette.m3.onSurface,
      }),
    },
  },
  MuiFab: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: radius.lg,
        backgroundColor: (theme.vars ?? theme).palette.m3.primaryContainer,
        color: (theme.vars ?? theme).palette.m3.onPrimaryContainer,
        '&:hover': {
          backgroundColor: (theme.vars ?? theme).palette.m3.primaryContainer,
          filter: 'brightness(0.96)',
        },
      }),
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: radius.sm },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: radius.xl,
        backgroundColor: (theme.vars ?? theme).palette.m3.surfaceContainerHigh,
      }),
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: radius.sm,
        backgroundColor: (theme.vars ?? theme).palette.m3.surfaceContainer,
      }),
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: { borderRadius: radius.sm },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: { borderRadius: radius.xs },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: { borderRadius: radius.full, height: 6 },
    },
  },
  MuiSnackbarContent: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: radius.sm,
        backgroundColor: (theme.vars ?? theme).palette.m3.inverseSurface,
        color: (theme.vars ?? theme).palette.m3.inverseOnSurface,
      }),
    },
  },
};
