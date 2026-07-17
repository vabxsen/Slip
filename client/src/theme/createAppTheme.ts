import { createTheme, type PaletteOptions, type Theme } from '@mui/material/styles';
import { buildM3Scheme, type M3ColorScheme } from './palette';
import { components } from './components';
import { shape } from './shape';
import { typography } from './typography';

/** Slip's brand seed color — every M3 color role is derived from it. */
export const SEED_COLOR = '#0b57d0';

/** Utility theme used only for palette math (contrast, light/dark shades). */
const paletteUtils = createTheme();

function colorFromRoles(main: string, on: string, container: string, onContainer: string) {
  const augmented = paletteUtils.palette.augmentColor({
    color: { main, contrastText: on },
  });
  return { ...augmented, container, onContainer };
}

function paletteFromScheme(m3: M3ColorScheme): PaletteOptions {
  return {
    primary: colorFromRoles(m3.primary, m3.onPrimary, m3.primaryContainer, m3.onPrimaryContainer),
    secondary: colorFromRoles(
      m3.secondary,
      m3.onSecondary,
      m3.secondaryContainer,
      m3.onSecondaryContainer,
    ),
    tertiary: colorFromRoles(
      m3.tertiary,
      m3.onTertiary,
      m3.tertiaryContainer,
      m3.onTertiaryContainer,
    ),
    error: colorFromRoles(m3.error, m3.onError, m3.errorContainer, m3.onErrorContainer),
    background: { default: m3.surface, paper: m3.surfaceContainerLow },
    text: { primary: m3.onSurface, secondary: m3.onSurfaceVariant },
    divider: m3.outlineVariant,
    m3,
  };
}

/**
 * Builds the app theme with light and dark M3 schemes derived from a seed.
 * Colors are emitted as CSS variables (mode switching happens via a `data-*`
 * attribute swap — no React re-render, no flash).
 */
export function createAppTheme(seed: string = SEED_COLOR, highContrast = false): Theme {
  return createTheme({
    cssVariables: { colorSchemeSelector: 'data' },
    colorSchemes: {
      light: { palette: paletteFromScheme(buildM3Scheme(seed, false)) },
      dark: { palette: paletteFromScheme(buildM3Scheme(seed, true, highContrast)) },
    },
    shape,
    typography,
    components,
  });
}
