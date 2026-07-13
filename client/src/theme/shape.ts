/** Material 3 shape scale (corner radii in px). */
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 28,
  full: 999,
} as const;

export const shape = {
  /**
   * Baseline for MUI's shape system. Note: `sx={{ borderRadius: n }}`
   * multiplies this value — prefer the `radius` tokens for explicit corners.
   */
  borderRadius: radius.md,
};
