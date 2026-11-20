import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ANALYTICS_ROUTE_TYPES } from '@/lib/constants/analytics';

const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

export const analytics = sqliteTable(
  'analytics',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    requestId: text('request_id').notNull(),
    routeType: text('route_type', { enum: ANALYTICS_ROUTE_TYPES }).notNull(),
    url: text('url').notNull(),
    pathname: text('pathname').notNull(),
    ua: text('ua'),
    os: text('os'),
    device: text('device'),
    browser: text('browser'),
    ip: text('ip'),
    duration: integer('duration').notNull(),
    statusCode: integer('status_code'),
    errorCode: integer('error_code'),
    visitAt: integer('visit_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
  },
  (table) => [
    index('analytics_visit_at_idx').on(table.visitAt),
    index('analytics_route_type_visit_at_idx').on(table.routeType, table.visitAt),
    check(
      'analytics_route_type_check',
      sql`${table.routeType} in (${sql.raw(ANALYTICS_ROUTE_TYPES.map((type) => `'${type}'`).join(', '))})`,
    ),
    check('analytics_duration_check', sql`typeof(${table.duration}) = 'integer' and ${table.duration} >= 0`),
    check(
      'analytics_status_code_check',
      sql`${table.statusCode} is null or (typeof(${table.statusCode}) = 'integer' and ${table.statusCode} between 200 and 599)`,
    ),
    check(
      'analytics_error_code_check',
      sql`${table.errorCode} is null or (typeof(${table.errorCode}) = 'integer' and ${table.errorCode} > 0)`,
    ),
  ],
);
