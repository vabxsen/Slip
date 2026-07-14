/** True if this browser supports the Notification API at all. */
export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  return notificationsSupported() ? Notification.permission : 'unsupported';
}

/** Requests permission if not already decided; returns whether it's usable now. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

/** Fires a system notification if supported, permitted, and the tab isn't focused. */
export function notify(title: string, options?: NotificationOptions): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  if (document.visibilityState === 'visible' && document.hasFocus()) return;
  try {
    new Notification(title, { icon: '/icons/icon-192.png', ...options });
  } catch {
    // Some platforms (e.g. iOS Safari) advertise support but throw on construction.
  }
}
