import { getIdToken } from '@/services/auth/auth';
import { emitWithAck } from '@/services/socket/socketClient';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Registers this connection as representing the signed-in user's claimed
 * username, so other users can find and connect to it by username. No-ops
 * if signed out or no username has been claimed yet — guest/offline-only
 * usage of the app is unaffected either way.
 */
export async function registerPresence(): Promise<void> {
  const user = useAuthStore.getState().user;
  const username = useSettingsStore.getState().username;
  if (!user || !username) return;

  const idToken = await getIdToken();
  if (!idToken) return;

  await emitWithAck<boolean>('presence:register', {
    idToken,
    username,
    displayName: useSettingsStore.getState().personalInfo.fullName || null,
  });
}
