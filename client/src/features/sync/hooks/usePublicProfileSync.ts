import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { pushPublicProfile } from '@/services/firestore/publicProfileCloud';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Mounted once at app startup, alongside useCloudSync. Keeps the public,
 * other-user-readable profile doc (username/displayName/photo — never
 * email) in sync whenever any of those change while signed in with a
 * claimed username. Kept separate from useCloudSync since it mixes in
 * authStore's photoURL, which that hook otherwise never touches.
 */
export function usePublicProfileSync(): void {
  const uid = useAuthStore((state) => state.user?.uid);
  const photoURL = useAuthStore((state) => state.user?.photoURL ?? null);
  const username = useSettingsStore((state) => state.username);
  const fullName = useSettingsStore((state) => state.personalInfo.fullName);

  useEffect(() => {
    if (!uid || !username) return;
    void pushPublicProfile(uid, { username, displayName: fullName || null, photoURL });
  }, [uid, username, fullName, photoURL]);
}
