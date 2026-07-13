import { useMediaQuery, useTheme } from '@mui/material';

/** True at the `md` breakpoint and up — where the nav rail replaces bottom navigation. */
export function useIsDesktop(): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });
}
