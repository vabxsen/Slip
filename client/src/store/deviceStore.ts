import type { DeviceInfo } from '@slip/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateDeviceName } from '@/utils/deviceName';
import { detectDeviceType, detectPlatformLabel } from '@/utils/platform';

interface DeviceState {
  /** This device's identity, as presented to peers. */
  device: DeviceInfo;
  renameDevice: (name: string) => void;
}

function createThisDevice(): DeviceInfo {
  return {
    id: crypto.randomUUID(),
    name: generateDeviceName(),
    type: detectDeviceType(),
    platform: detectPlatformLabel(),
  };
}

/**
 * Persistent device identity: id and name survive reloads; type and platform
 * are re-detected on every launch (browser/OS can change).
 */
export const useDeviceStore = create<DeviceState>()(
  persist(
    (set) => ({
      device: createThisDevice(),
      renameDevice: (name) =>
        set((state) => ({
          device: { ...state.device, name: name.trim() || state.device.name },
        })),
    }),
    {
      name: 'slip-device',
      version: 1,
      partialize: (state) => ({ device: state.device }),
      merge: (persisted, current) => {
        const stored = (persisted as Partial<DeviceState> | undefined)?.device;
        return {
          ...current,
          device: {
            ...current.device,
            ...(stored?.id ? { id: stored.id } : {}),
            ...(stored?.name ? { name: stored.name } : {}),
            type: detectDeviceType(),
            platform: detectPlatformLabel(),
          },
        };
      },
    },
  ),
);

// `persist` only writes on set(), not on store creation — without this no-op
// write, a first-time visitor would get a new identity on every reload.
useDeviceStore.setState((state) => ({ device: state.device }));
