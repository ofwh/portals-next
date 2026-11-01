import { sql } from 'drizzle-orm';
import { check, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

export const shortcuts = sqliteTable(
  'shortcuts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    type: text('type', { enum: ['proxy', 'redirect', 'cache', 'original'] }).notNull(),
    pathname: text('pathname').notNull(),
    status: integer('status', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(now)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('shortcuts_type_unique').on(table.type),
    uniqueIndex('shortcuts_pathname_unique').on(table.pathname),
    check('shortcuts_type_check', sql`${table.type} in ('proxy', 'redirect', 'cache', 'original')`),
  ],
);
