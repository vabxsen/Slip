import { Box } from '@mui/material';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface FabSlotContextValue {
  container: HTMLElement | null;
  setContainer: (el: HTMLElement | null) => void;
}

const FabSlotContext = createContext<FabSlotContextValue | null>(null);

export function FabSlotProvider({ children }: { children: ReactNode }) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  return (
    <FabSlotContext.Provider value={{ container, setContainer }}>
      {children}
    </FabSlotContext.Provider>
  );
}

/**
 * Fixed anchor for the page FAB — bottom-right, lifted above the bottom
 * navigation on mobile. Rendered once by AppLayout.
 */
export function FabSlotHost() {
  const ctx = useContext(FabSlotContext);
  const setContainer = ctx?.setContainer;
  const attach = useCallback((el: HTMLElement | null) => setContainer?.(el), [setContainer]);

  return (
    <Box
      ref={attach}
      sx={{
        position: 'fixed',
        right: { xs: 16, md: 24 },
        bottom: { xs: 'calc(88px + env(safe-area-inset-bottom))', md: 24 },
        zIndex: 'fab',
      }}
    />
  );
}

/**
 * Renders its children (typically a `<Fab>`) into the layout's FAB anchor.
 * Pages use this to own their FAB while the layout owns its placement.
 */
export function PageFab({ children }: { children: ReactNode }) {
  const ctx = useContext(FabSlotContext);
  if (!ctx?.container) return null;
  return createPortal(children, ctx.container);
}
