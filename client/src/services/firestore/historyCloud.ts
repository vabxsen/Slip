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
