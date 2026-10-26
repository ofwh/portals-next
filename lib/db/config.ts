import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export function getDatabasePath(): string {
  const databasePath = resolve(process.env.DATABASE_URL || './data/portals.db');

  mkdirSync(dirname(databasePath), { recursive: true });

  return databasePath;
}
