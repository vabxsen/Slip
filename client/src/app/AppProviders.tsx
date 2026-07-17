import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { useMemo, type ReactNode } from 'react';
import { createAppTheme } from '@/theme';
import { useSettingsStore } from '@/store/settingsStore';
import { queryClient } from './queryClient';

interface AppProvidersProps {
  children: ReactNode;
}

/** Global providers: M3 theme (light/dark via CSS variables) + React Query. */
export function AppProviders({ children }: AppProvidersProps) {
  const seedColor = useSettingsStore((state) => state.seedColor);
  const highContrast = useSettingsStore((state) => state.highContrast);
  const theme = useMemo(() => createAppTheme(seedColor, highContrast), [seedColor, highContrast]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme} defaultMode="system">
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
