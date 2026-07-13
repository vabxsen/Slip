import type { TypographyVariantsOptions } from '@mui/material/styles';

export const FONT_FAMILY = "'Roboto Variable', Roboto, 'Helvetica Neue', Arial, sans-serif";

/** MUI variants mapped onto the Material 3 type scale. */
export const typography: TypographyVariantsOptions = {
  fontFamily: FONT_FAMILY,
  // Display
  h1: { fontSize: '3.5625rem', lineHeight: 64 / 57, fontWeight: 400, letterSpacing: '-0.25px' },
  h2: { fontSize: '2.8125rem', lineHeight: 52 / 45, fontWeight: 400 },
  h3: { fontSize: '2.25rem', lineHeight: 44 / 36, fontWeight: 400 },
  // Headline
  h4: { fontSize: '2rem', lineHeight: 40 / 32, fontWeight: 400 },
  h5: { fontSize: '1.75rem', lineHeight: 36 / 28, fontWeight: 400 },
  h6: { fontSize: '1.5rem', lineHeight: 32 / 24, fontWeight: 400 },
  // Title
  subtitle1: { fontSize: '1rem', lineHeight: 24 / 16, fontWeight: 500, letterSpacing: '0.15px' },
  subtitle2: { fontSize: '0.875rem', lineHeight: 20 / 14, fontWeight: 500, letterSpacing: '0.1px' },
  // Body
  body1: { fontSize: '1rem', lineHeight: 24 / 16, letterSpacing: '0.5px' },
  body2: { fontSize: '0.875rem', lineHeight: 20 / 14, letterSpacing: '0.25px' },
  // Label
  button: { fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.1px', textTransform: 'none' },
  caption: { fontSize: '0.75rem', lineHeight: 16 / 12, letterSpacing: '0.4px' },
  overline: {
    fontSize: '0.6875rem',
    lineHeight: 16 / 11,
    fontWeight: 500,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
};
