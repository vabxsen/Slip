import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DownloadPreference = 'ask' | 'auto';

export interface TrustedDevice {
  id: string;
  name: string;
}

interface SettingsState {
  /** 'ask' offers a save-folder picker on supporting browsers; 'auto' always downloads to Downloads. */
  downloadPreference: DownloadPreference;
  notificationsEnabled: boolean;
  autoAcceptTrusted: boolean;
  trustedDevices: TrustedDevice[];
  setDownloadPreference: (pref: DownloadPreference) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setAutoAcceptTrusted: (enabled: boolean) => void;
  trustDevice: (device: TrustedDevice) => void;
  untrustDevice: (id: string) => void;
  isTrusted: (id: string) => boolean;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      downloadPreference: 'ask',
      notificationsEnabled: false,
      autoAcceptTrusted: false,
      trustedDevices: [],
      setDownloadPreference: (downloadPreference) => set({ downloadPreference }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setAutoAcceptTrusted: (autoAcceptTrusted) => set({ autoAcceptTrusted }),
      trustDevice: (device) =>
        set((state) => ({
          trustedDevices: [...state.trustedDevices.filter((d) => d.id !== device.id), device],
        })),
      untrustDevice: (id) =>
        set((state) => ({ trustedDevices: state.trustedDevices.filter((d) => d.id !== id) })),
      isTrusted: (id) => get().trustedDevices.some((d) => d.id === id),
    }),
    { name: 'slip-settings', version: 1 },
  ),
);
