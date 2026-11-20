import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

export const tags = sqliteTable(
  'tags',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    group: text('group').notNull(),
    label: text('label').notNull(),
    color: text('color').notNull().default(''),
    bgColor: text('bg_color').notNull().default(''),
    border: integer('border').$type<0 | 1>().notNull().default(1),
    rounded: integer('rounded').$type<0 | 1>().notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(now)
      .$onUpdate(() => new Date()),
  },
  (table) => [index('tags_group_idx').on(table.group)],
);

export const tagConfigs = sqliteTable(
  'tag_configs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    targetId: text('target_id').notNull(),
    type: text('type').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(now)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('tag_configs_tag_type_target_unique').on(table.tagId, table.type, table.targetId),
    index('tag_configs_type_target_idx').on(table.type, table.targetId),
  ],
);
