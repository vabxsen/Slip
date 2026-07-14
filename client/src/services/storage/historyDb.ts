import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { HistoryRecord } from '@/features/history/types';

interface SlipDBSchema extends DBSchema {
  transfers: {
    key: string;
    value: HistoryRecord;
    indexes: { completedAt: number };
  };
}

const DB_NAME = 'slip-history';
const DB_VERSION = 1;
const STORE = 'transfers';

let dbPromise: Promise<IDBPDatabase<SlipDBSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<SlipDBSchema>> {
  dbPromise ??= openDB<SlipDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(STORE, { keyPath: 'id' });
      store.createIndex('completedAt', 'completedAt');
    },
  });
  return dbPromise;
}

export async function saveHistoryRecord(record: HistoryRecord): Promise<void> {
  const db = await getDb();
  await db.put(STORE, record);
}

/** All persisted transfers, newest first. */
export async function getAllHistoryRecords(): Promise<HistoryRecord[]> {
  const db = await getDb();
  const records = await db.getAllFromIndex(STORE, 'completedAt');
  return records.reverse();
}

export async function clearHistory(): Promise<void> {
  const db = await getDb();
  await db.clear(STORE);
}
