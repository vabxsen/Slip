import type { Firestore, Unsubscribe } from 'firebase/firestore';
import type { PersonalInfo, TrustedDevice } from '@/store/settingsStore';
import { getFirestoreInstance } from './firestoreClient';

export interface UserSettingsDoc {
  personalInfo: PersonalInfo;
  trustedDevices: TrustedDevice[];
}

async function userDocRef(db: Firestore, uid: string) {
  const { doc } = await import('firebase/firestore');
  return doc(db, 'users', uid);
}

/**
 * Reconciles this device's local settings with the cloud on sign-in.
 * - No cloud doc yet: seeds it from the current local state (first-ever sign-in)
 *   and returns null (nothing to merge in — local state is already correct).
 * - Cloud doc exists: returns it so the caller can merge (cloud name wins if
 *   set, trusted devices are unioned by the caller via the existing
 *   `trustDevice` action) rather than letting either side clobber the other.
 */
export async function fetchUserDocForMerge(
  uid: string,
  local: UserSettingsDoc,
): Promise<UserSettingsDoc | null> {
  const db = await getFirestoreInstance();
  if (!db) return null;
  const { getDoc } = await import('firebase/firestore');
  const ref = await userDocRef(db, uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    await pushUserDoc(uid, local);
    return null;
  }
  return snapshot.data() as UserSettingsDoc;
}

export async function pushUserDoc(uid: string, value: UserSettingsDoc): Promise<void> {
  const db = await getFirestoreInstance();
  if (!db) return;
  const { setDoc } = await import('firebase/firestore');
  const ref = await userDocRef(db, uid);
  await setDoc(ref, value, { merge: true });
}

export async function subscribeToUserDoc(
  uid: string,
  callback: (value: UserSettingsDoc) => void,
): Promise<Unsubscribe | null> {
  const db = await getFirestoreInstance();
  if (!db) return null;
  const { onSnapshot } = await import('firebase/firestore');
  const ref = await userDocRef(db, uid);
  return onSnapshot(ref, (snapshot) => {
    if (snapshot.exists()) callback(snapshot.data() as UserSettingsDoc);
  });
}
