import { useEffect } from 'react';

const APP_NAME = 'Slip';

/** Sets the document title for the current page, restoring the default on unmount. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = APP_NAME;
    };
  }, [title]);
}
