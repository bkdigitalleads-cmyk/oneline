import * as SQLite from 'expo-sqlite';

export interface Entry {
  date: string; // 'YYYY-MM-DD' local calendar day, primary key
  text: string;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('oneline.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS entries (
          date TEXT PRIMARY KEY NOT NULL,
          text TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
      `);
      return db;
    })();
  }
  return dbPromise;
}

function rowToEntry(row: any): Entry {
  return {
    date: row.date,
    text: row.text,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function upsertEntry(date: string, text: string): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    await db.runAsync('DELETE FROM entries WHERE date = ?', [date]);
    return;
  }
  await db.runAsync(
    `INSERT INTO entries (date, text, created_at, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET text = excluded.text, updated_at = excluded.updated_at`,
    [date, trimmed, now, now]
  );
}

export async function getEntry(date: string): Promise<Entry | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>('SELECT * FROM entries WHERE date = ?', [date]);
  return row ? rowToEntry(row) : null;
}

export async function getEntries(dates: string[]): Promise<Entry[]> {
  if (dates.length === 0) return [];
  const db = await getDb();
  const placeholders = dates.map(() => '?').join(',');
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM entries WHERE date IN (${placeholders}) ORDER BY date DESC`,
    dates
  );
  return rows.map(rowToEntry);
}

export async function getAllEntries(): Promise<Entry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>('SELECT * FROM entries ORDER BY date DESC');
  return rows.map(rowToEntry);
}

export async function getAllEntryDates(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>('SELECT date FROM entries ORDER BY date DESC');
  return rows.map((r) => r.date);
}

export async function searchEntries(query: string): Promise<Entry[]> {
  const db = await getDb();
  // Escape LIKE wildcards in user input, then wrap in %...%
  const escaped = query.replace(/([%_\\])/g, '\\$1');
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM entries WHERE text LIKE ? ESCAPE '\\' ORDER BY date DESC LIMIT 200`,
    [`%${escaped}%`]
  );
  return rows.map(rowToEntry);
}

export async function countEntries(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>('SELECT COUNT(*) AS n FROM entries');
  return row?.n ?? 0;
}

export async function deleteAllEntries(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM entries');
}

/** CSV export of every entry (date,text), RFC-4180 quoting. */
export async function exportCsv(): Promise<string> {
  const entries = await getAllEntries();
  const lines = ['date,entry'];
  for (const e of [...entries].reverse()) {
    const safe = '"' + e.text.replace(/"/g, '""') + '"';
    lines.push(`${e.date},${safe}`);
  }
  return lines.join('\r\n');
}
