import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import 'server-only';
import { getDatabasePath } from './config';
import * as schema from './schema';

function createDatabase() {
  const client = new Database(getDatabasePath());

  client.pragma('journal_mode = WAL');
  client.pragma('foreign_keys = ON');
  client.pragma('busy_timeout = 5000');

  return drizzle(client, { schema });
}

const globalForDb = globalThis as typeof globalThis & {
  portalsDb?: ReturnType<typeof createDatabase>;
};

export const db = globalForDb.portalsDb ?? createDatabase();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.portalsDb = db;
}
