import { sql } from 'drizzle-orm';
import { check, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

export const redirects = sqliteTable(
  'redirects',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    description: text('description'),
    status: integer('status', { mode: 'boolean' }).notNull().default(true),
    pathname: text('pathname').notNull(),
    url: text('url').notNull(),
    statusCode: integer('status_code').$type<301 | 302 | 307 | 308>().notNull().default(302),
    token: text('token'),
    expiredAt: integer('expired_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(now)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('redirects_pathname_unique').on(table.pathname),
    check('redirects_status_code_check', sql`${table.statusCode} in (301, 302, 307, 308)`),
  ],
);

export const caches = sqliteTable(
  'caches',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    description: text('description'),
    pathname: text('pathname').notNull(),
    url: text('url').notNull(),
    ttl: integer('ttl').notNull().default(0),
    status: integer('status', { mode: 'boolean' }).notNull().default(true),
    method: text('method', { enum: ['GET', 'POST'] })
      .notNull()
      .default('GET'),
    body: text('body'),
    format: text('format', { enum: ['JSON', 'TEXT', 'FORM'] })
      .notNull()
      .default('JSON'),
    headers: text('headers'),
    proxy: text('proxy'),
    cors: integer('cors').$type<-1 | 0 | 1>().notNull().default(0),
    token: text('token'),
    expiredAt: integer('expired_at', { mode: 'timestamp_ms' }),
    cachedAt: integer('cached_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(now)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('caches_pathname_unique').on(table.pathname),
    check('caches_method_check', sql`${table.method} in ('GET', 'POST')`),
    check('caches_format_check', sql`${table.format} in ('JSON', 'TEXT', 'FORM')`),
    check('caches_cors_check', sql`${table.cors} in (-1, 0, 1)`),
  ],
);

export const originals = sqliteTable(
  'originals',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    description: text('description'),
    status: integer('status', { mode: 'boolean' }).notNull().default(true),
    pathname: text('pathname').notNull(),
    content: text('content').notNull(),
    contentType: text('content_type').notNull().default('application/json'),
    language: text('language').notNull().default('plaintext'),
    token: text('token'),
    expiredAt: integer('expired_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(now)
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('originals_pathname_unique').on(table.pathname)],
);

export const proxies = sqliteTable(
  'proxies',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    description: text('description'),
    status: integer('status', { mode: 'boolean' }).notNull().default(true),
    pathname: text('pathname').notNull(),
    url: text('url').notNull(),
    method: text('method', { enum: ['GET', 'POST'] })
      .notNull()
      .default('GET'),
    body: text('body'),
    format: text('format', { enum: ['JSON', 'TEXT', 'FORM'] })
      .notNull()
      .default('JSON'),
    headers: text('headers'),
    proxy: text('proxy'),
    cors: integer('cors').$type<-1 | 0 | 1>().notNull().default(0),
    token: text('token'),
    expiredAt: integer('expired_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(now)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('proxies_pathname_unique').on(table.pathname),
    check('proxies_method_check', sql`${table.method} in ('GET', 'POST')`),
    check('proxies_format_check', sql`${table.format} in ('JSON', 'TEXT', 'FORM')`),
    check('proxies_cors_check', sql`${table.cors} in (-1, 0, 1)`),
  ],
);
