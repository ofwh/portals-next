import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

export const subscriptions = sqliteTable(
  'subscriptions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    description: text('description'),
    status: integer('status', { mode: 'boolean' }).notNull().default(true),
    pathname: text('pathname').notNull(),
    flow: text('flow'),
    flowDraft: text('flow_draft'),
    token: text('token'),
    expiredAt: integer('expired_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(now)
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('subscriptions_pathname_unique').on(table.pathname)],
);
