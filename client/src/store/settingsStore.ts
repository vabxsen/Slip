import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SEED_COLOR } from '@/theme';

export type DownloadPreference = 'ask' | 'auto';

export interface TrustedDevice {
  id: string;
  name: string;
}

export interface PersonalInfo {
  fullName: string;
}

const EMPTY_PERSONAL_INFO: PersonalInfo = { fullName: '' };

interface SettingsState {
  /** 'ask' offers a save-folder picker on supporting browsers; 'auto' always downloads to Downloads. */
  downloadPreference: DownloadPreference;
  notificationsEnabled: boolean;
  autoAcceptTrusted: boolean;
  trustedDevices: TrustedDevice[];
  /** Hex seed color the whole M3 palette is derived from. */
  seedColor: string;
  /** Local-only when signed out; synced to the user's Google account via Firestore when signed in — see useCloudSync. */
  personalInfo: PersonalInfo;
  /** Permanent once claimed — set only via the claimUsername transaction or cloud-sync replication, never a plain edit. */
  username: string | null;
  setDownloadPreference: (pref: DownloadPreference) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setAutoAcceptTrusted: (enabled: boolean) => void;
  trustDevice: (device: TrustedDevice) => void;
  untrustDevice: (id: string) => void;
  isTrusted: (id: string) => boolean;
  setSeedColor: (hex: string) => void;
  setPersonalInfo: (info: PersonalInfo) => void;
  setUsernameLocal: (username: string | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      downloadPreference: 'ask',
      notificationsEnabled: false,
      autoAcceptTrusted: false,
      trustedDevices: [],
      seedColor: SEED_COLOR,
      personalInfo: EMPTY_PERSONAL_INFO,
      username: null,
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
      setSeedColor: (hex) => set({ seedColor: hex }),
      setPersonalInfo: (personalInfo) => set({ personalInfo }),
      setUsernameLocal: (username) => set({ username }),
    }),
    { name: 'slip-settings', version: 1 },
  ),
);
