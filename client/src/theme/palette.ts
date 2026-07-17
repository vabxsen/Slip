import {
  argbFromHex,
  Hct,
  hexFromArgb,
  MaterialDynamicColors,
  SchemeTonalSpot,
  type DynamicColor,
} from '@material/material-color-utilities';

/**
 * Full Material Design 3 color scheme (all color roles), generated from a
 * seed color with Google's official HCT color engine. Because schemes are
 * derived at runtime, dynamic color (user- or wallpaper-picked seeds) is a
 * one-line change later.
 */
export interface M3ColorScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;
}

const ROLES: Record<keyof M3ColorScheme, DynamicColor> = {
  primary: MaterialDynamicColors.primary,
  onPrimary: MaterialDynamicColors.onPrimary,
  primaryContainer: MaterialDynamicColors.primaryContainer,
  onPrimaryContainer: MaterialDynamicColors.onPrimaryContainer,
  secondary: MaterialDynamicColors.secondary,
  onSecondary: MaterialDynamicColors.onSecondary,
  secondaryContainer: MaterialDynamicColors.secondaryContainer,
  onSecondaryContainer: MaterialDynamicColors.onSecondaryContainer,
  tertiary: MaterialDynamicColors.tertiary,
  onTertiary: MaterialDynamicColors.onTertiary,
  tertiaryContainer: MaterialDynamicColors.tertiaryContainer,
  onTertiaryContainer: MaterialDynamicColors.onTertiaryContainer,
  error: MaterialDynamicColors.error,
  onError: MaterialDynamicColors.onError,
  errorContainer: MaterialDynamicColors.errorContainer,
  onErrorContainer: MaterialDynamicColors.onErrorContainer,
  surface: MaterialDynamicColors.surface,
  onSurface: MaterialDynamicColors.onSurface,
  surfaceVariant: MaterialDynamicColors.surfaceVariant,
  onSurfaceVariant: MaterialDynamicColors.onSurfaceVariant,
  surfaceDim: MaterialDynamicColors.surfaceDim,
  surfaceBright: MaterialDynamicColors.surfaceBright,
  surfaceContainerLowest: MaterialDynamicColors.surfaceContainerLowest,
  surfaceContainerLow: MaterialDynamicColors.surfaceContainerLow,
  surfaceContainer: MaterialDynamicColors.surfaceContainer,
  surfaceContainerHigh: MaterialDynamicColors.surfaceContainerHigh,
  surfaceContainerHighest: MaterialDynamicColors.surfaceContainerHighest,
  inverseSurface: MaterialDynamicColors.inverseSurface,
  inverseOnSurface: MaterialDynamicColors.inverseOnSurface,
  inversePrimary: MaterialDynamicColors.inversePrimary,
  outline: MaterialDynamicColors.outline,
  outlineVariant: MaterialDynamicColors.outlineVariant,
  shadow: MaterialDynamicColors.shadow,
  scrim: MaterialDynamicColors.scrim,
};

export function buildM3Scheme(
  seedHex: string,
  isDark: boolean,
  highContrast = false,
): M3ColorScheme {
  const scheme = new SchemeTonalSpot(Hct.fromInt(argbFromHex(seedHex)), isDark, 0);
  const entries = Object.entries(ROLES).map(([role, color]) => [
    role,
    hexFromArgb(color.getArgb(scheme)),
  ]);
  const result = Object.fromEntries(entries) as unknown as M3ColorScheme;

  // High contrast dark mode: pitch-black background/app-bar instead of the
  // computed tonal-gray surface. Containers (cards, dialogs, menus) keep
  // their normal tones so they still stand out against the black backdrop.
  if (isDark && highContrast) {
    result.surface = '#000000';
  }

  return result;
}
