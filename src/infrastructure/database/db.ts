import * as SQLite from 'expo-sqlite';

/**
 * Local metadata store. Only metadata and file URIs are stored — never photo binaries
 * (web dev preview stores small thumbnail data URIs, see docs/DECISIONS.md D-006).
 */
const DB_NAME = 'cutpick.db';

const MIGRATIONS: string[] = [
  // v1
  `
  CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    source_context TEXT NOT NULL,
    platforms_json TEXT NOT NULL,
    target_count INTEGER NOT NULL,
    preset_id TEXT NOT NULL,
    is_sample INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    local_uri TEXT NOT NULL,
    asset_id TEXT,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    created_at TEXT,
    orientation TEXT NOT NULL,
    thumbnail_uri TEXT,
    phash TEXT,
    metrics_json TEXT,
    scene_tags_json TEXT NOT NULL DEFAULT '[]',
    dup_group_id TEXT,
    status TEXT NOT NULL,
    error TEXT,
    import_index INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_photos_project ON photos(project_id, import_index);
  CREATE TABLE IF NOT EXISTS recommendation_sets (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    purpose_id TEXT NOT NULL,
    data_json TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(project_id, purpose_id)
  );
  CREATE TABLE IF NOT EXISTS preference_events (
    id TEXT PRIMARY KEY NOT NULL,
    type TEXT NOT NULL,
    features_json TEXT,
    preset_id TEXT,
    created_at TEXT NOT NULL
  );
  `,
];

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  if (process.env.EXPO_OS !== 'web') await db.execAsync('PRAGMA journal_mode = WAL;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  while (version < MIGRATIONS.length) {
    await db.execAsync(MIGRATIONS[version]);
    version++;
    await db.execAsync(`PRAGMA user_version = ${version}`);
  }
}

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await migrate(db);
      return db;
    })();
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM kv WHERE key = ?', key);
  if (!row) return null;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return null;
  }
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', key, JSON.stringify(value));
}

export async function kvDelete(key: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM kv WHERE key = ?', key);
}

/** Wipes every local table (used by "delete all local data"). */
export async function wipeAllLocalData(): Promise<void> {
  const db = await getDb();
  await db.execAsync('DELETE FROM recommendation_sets; DELETE FROM photos; DELETE FROM projects; DELETE FROM preference_events; DELETE FROM kv;');
}
