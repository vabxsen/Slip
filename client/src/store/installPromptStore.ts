import { create } from 'zustand';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

interface InstallPromptState {
  deferredEvent: BeforeInstallPromptEvent | null;
  installed: boolean;
}

export const useInstallPromptStore = create<InstallPromptState>(() => ({
  deferredEvent: null,
  installed: isStandalone(),
}));

/**
 * `beforeinstallprompt` fires once, early, whenever it fires at all — a
 * listener only attached once the user happens to open Settings would miss
 * it. Registering at module load (imported from `main.tsx`, before React
 * renders) means it's always caught regardless of which page is open.
 */
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  useInstallPromptStore.setState({ deferredEvent: event as BeforeInstallPromptEvent });
});

window.addEventListener('appinstalled', () => {
  useInstallPromptStore.setState({ installed: true, deferredEvent: null });
});
