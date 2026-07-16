import type { Unsubscribe } from 'firebase/firestore';
import type { HistoryRecord } from '@/features/history/types';
import { getFirestoreInstance } from './firestoreClient';

/** Firestore rejects `undefined` field values, unlike IndexedDB — strip absent optional fields. */
function toFirestorePayload(record: HistoryRecord): HistoryRecord {
  const { errorMessage, ...rest } = record;
  return errorMessage === undefined ? (rest as HistoryRecord) : record;
}

export async function writeHistoryRecordToCloud(uid: string, record: HistoryRecord): Promise<void> {
  const db = await getFirestoreInstance();
  if (!db) return;
  const { doc, setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, 'users', uid, 'history', record.id), toFirestorePayload(record));
}

/** Deletes every history doc in the cloud, so cleared history can't sync back. */
export async function clearHistoryInCloud(uid: string): Promise<void> {
  const db = await getFirestoreInstance();
  if (!db) return;
  const { collection, getDocs, writeBatch } = await import('firebase/firestore');
  const snapshot = await getDocs(collection(db, 'users', uid, 'history'));
  if (snapshot.empty) return;
  // Firestore batches cap at 500 writes — chunk to stay under it.
  const docs = snapshot.docs;
  for (let i = 0; i < docs.length; i += 450) {
    const batch = writeBatch(db);
    for (const docSnapshot of docs.slice(i, i + 450)) batch.delete(docSnapshot.ref);
    await batch.commit();
  }
}

export async function subscribeToHistoryCollection(
  uid: string,
  callback: (records: HistoryRecord[]) => void,
): Promise<Unsubscribe | null> {
  const db = await getFirestoreInstance();
  if (!db) return null;
  const { collection, onSnapshot } = await import('firebase/firestore');
  return onSnapshot(collection(db, 'users', uid, 'history'), (snapshot) => {
    callback(snapshot.docs.map((docSnapshot) => docSnapshot.data() as HistoryRecord));
  });
}
