/** Broad device category, used for icons and copy across the app. */
export type DeviceType = 'desktop' | 'laptop' | 'tablet' | 'phone' | 'unknown';

/** Identity a device presents when pairing and signaling. */
export interface DeviceInfo {
  /** Stable per-install identifier (generated client-side, persisted locally). */
  id: string;
  /** Human-friendly display name, e.g. "Sunny Falcon" or a user-chosen name. */
  name: string;
  type: DeviceType;
  /** OS / browser hint for display, e.g. "Windows · Chrome". */
  platform: string;
}
