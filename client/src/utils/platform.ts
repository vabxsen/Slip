import type { DeviceType } from '@slip/shared';

export function detectDeviceType(): DeviceType {
  const ua = navigator.userAgent;
  if (/iPad|Macintosh.*Mobile|Android(?!.*Mobile)|Tablet/i.test(ua)) return 'tablet';
  if (/iPhone|iPod|Android.*Mobile|Mobi/i.test(ua)) return 'phone';
  return 'desktop';
}

function detectOs(): string {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return 'Windows';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Unknown OS';
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/OPR\//i.test(ua)) return 'Opera';
  if (/Chrome\//i.test(ua)) return 'Chrome';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Safari\//i.test(ua)) return 'Safari';
  return 'Browser';
}

/** Human-readable platform label, e.g. "Windows · Chrome". */
export function detectPlatformLabel(): string {
  return `${detectOs()} · ${detectBrowser()}`;
}
