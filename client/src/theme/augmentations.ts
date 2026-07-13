import type { M3ColorScheme } from './palette';

declare module '@mui/material/styles' {
  interface Palette {
    /** Full Material 3 color roles, also exposed as CSS variables. */
    m3: M3ColorScheme;
    tertiary: Palette['primary'];
  }

  interface PaletteOptions {
    m3?: M3ColorScheme;
    tertiary?: PaletteOptions['primary'];
  }

  interface PaletteColor {
    container?: string;
    onContainer?: string;
  }

  interface SimplePaletteColorOptions {
    container?: string;
    onContainer?: string;
  }
}
