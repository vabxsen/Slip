import type { DeviceInfo } from '@slip/shared';

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const MAX_DEVICE_FIELD_LENGTH = 60;
const MAX_MESSAGE_LENGTH = 2000;

export function isValidUsername(value: unknown): value is string {
  return typeof value === 'string' && USERNAME_PATTERN.test(value);
}

/** Clamps a peer-supplied device's display fields to a sane length before it's stored or relayed. */
export function sanitizeDevice(device: DeviceInfo): DeviceInfo {
  return {
    ...device,
    name: typeof device.name === 'string' && device.name.trim() ? device.name.slice(0, MAX_DEVICE_FIELD_LENGTH) : 'Unknown device',
    platform: typeof device.platform === 'string' ? device.platform.slice(0, MAX_DEVICE_FIELD_LENGTH) : '',
  };
}

export function isValidMessageText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_MESSAGE_LENGTH;
}
