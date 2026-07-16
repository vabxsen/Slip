import { useInstallPromptStore } from '@/store/installPromptStore';

/** Reads the globally-captured `beforeinstallprompt` state for an "Install app" button. */
export function useInstallPrompt() {
  const deferredEvent = useInstallPromptStore((state) => state.deferredEvent);
  const installed = useInstallPromptStore((state) => state.installed);

  const promptInstall = async () => {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    const { outcome } = await deferredEvent.userChoice;
    useInstallPromptStore.setState({
      deferredEvent: null,
      installed: outcome === 'accepted' ? true : installed,
    });
  };

  return { canInstall: Boolean(deferredEvent) && !installed, installed, promptInstall };
}
