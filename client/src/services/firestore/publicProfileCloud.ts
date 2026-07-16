import type { PublicProfile } from '@slip/shared';
import { getFirestoreInstance } from './firestoreClient';

export interface PublicProfileDoc {
  username: string;
  displayName: string | null;
  photoURL: string | null;
}

/** Pushes the signed-in user's public profile — never includes email. No uniqueness logic needed here; that's owned by usernames/{x}. */
export async function pushPublicProfile(uid: string, profile: PublicProfileDoc): Promise<void> {
  const db = await getFirestoreInstance();
  if (!db) return;
  const { doc, setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, 'publicProfiles', uid), profile);
}

/** Resolves a typed username to its public profile, or null if unclaimed/not found. */
export async function fetchPublicProfileByUsername(username: string): Promise<PublicProfile | null> {
  const db = await getFirestoreInstance();
  if (!db) return null;
  const { doc, getDoc } = await import('firebase/firestore');

  const usernameSnap = await getDoc(doc(db, 'usernames', username.toLowerCase()));
  if (!usernameSnap.exists()) return null;
  const { uid } = usernameSnap.data() as { uid: string };

  const profileSnap = await getDoc(doc(db, 'publicProfiles', uid));
  if (!profileSnap.exists()) return null;
  return profileSnap.data() as PublicProfileDoc;
}
