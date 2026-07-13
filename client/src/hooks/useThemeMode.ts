import { useColorScheme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * App-level theme mode API. Wraps MUI's `useColorScheme` (which already
 * persists the choice to localStorage and tracks the OS preference) so the
 * rest of the app never depends on MUI internals directly.
 */
export function useThemeMode() {
  const { mode, setMode, systemMode } = useColorScheme();

  const currentMode: ThemeMode = mode ?? 'system';
  const resolvedMode: 'light' | 'dark' =
    (currentMode === 'system' ? systemMode : currentMode) ?? 'light';

  return { mode: currentMode, resolvedMode, setMode };
}
