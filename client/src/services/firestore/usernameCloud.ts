import { getFirestoreInstance } from './firestoreClient';

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export type ClaimResult =
  | { ok: true }
  | { ok: false; reason: 'taken' | 'already-set' | 'invalid' | 'offline' | 'unknown' };

/**
 * Atomically claims a username: reads both the uniqueness-key doc and the
 * user's own doc, aborts if either shows the name (or any name) is already
 * taken, otherwise writes both in one transaction. This is what actually
 * closes the race window — two simultaneous claims of the same name can't
 * both commit. Security rules independently enforce the same invariants
 * server-side, so this stays safe even against a buggy client.
 */
export async function claimUsername(uid: string, chosen: string): Promise<ClaimResult> {
  if (!USERNAME_PATTERN.test(chosen)) return { ok: false, reason: 'invalid' };

  const db = await getFirestoreInstance();
  if (!db) return { ok: false, reason: 'offline' };

  const normalized = chosen.toLowerCase();
  const { doc, runTransaction } = await import('firebase/firestore');
  const usernameRef = doc(db, 'usernames', normalized);
  const userRef = doc(db, 'users', uid);

  try {
    await runTransaction(db, async (tx) => {
      const [usernameSnap, userSnap] = await Promise.all([tx.get(usernameRef), tx.get(userRef)]);
      if (usernameSnap.exists()) throw new Error('taken');
      const existingUsername = (userSnap.data() as { username?: string | null } | undefined)?.username;
      if (existingUsername) throw new Error('already-set');
      tx.set(usernameRef, { uid });
      tx.set(userRef, { username: chosen }, { merge: true });
    });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'taken' || message === 'already-set') return { ok: false, reason: message };
    return { ok: false, reason: 'unknown' };
  }
}
