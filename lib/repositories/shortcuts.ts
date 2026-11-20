import { count, desc, eq } from 'drizzle-orm';
import 'server-only';
import { db } from '@/lib/db';
import { shortcuts } from '@/lib/db/schema';
import type { Pagination, PaginationParams } from '@/lib/types/pagination';

export type ShortcutRow = typeof shortcuts.$inferSelect;
export type ShortcutValues = Omit<typeof shortcuts.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;

export function pagination({ page, size }: PaginationParams): Pagination<ShortcutRow> {
  return db.transaction((tx) => {
    const total = tx.select({ value: count() }).from(shortcuts).get()?.value ?? 0;
    const data = tx
      .select()
      .from(shortcuts)
      .orderBy(desc(shortcuts.updatedAt), desc(shortcuts.id))
      .limit(size)
      .offset((page - 1) * size)
      .all();

    return { data, total, page, size };
  });
}

export function findById(id: string): ShortcutRow | undefined {
  return db.select().from(shortcuts).where(eq(shortcuts.id, id)).get();
}

export function findByPath(pathname: string): ShortcutRow | undefined {
  return db.select().from(shortcuts).where(eq(shortcuts.pathname, pathname)).get();
}

export function findByType(type: ShortcutRow['type']): ShortcutRow | undefined {
  return db.select().from(shortcuts).where(eq(shortcuts.type, type)).get();
}

export function create(values: ShortcutValues): ShortcutRow {
  return db.insert(shortcuts).values(values).returning().get();
}

export function update(id: string, values: Partial<ShortcutValues>): ShortcutRow | undefined {
  return db
    .update(shortcuts)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(shortcuts.id, id))
    .returning()
    .get();
}

export function remove(id: string): ShortcutRow | undefined {
  return db.delete(shortcuts).where(eq(shortcuts.id, id)).returning().get();
}

const repository = { pagination, findById, findByPath, create, update, remove, findByType };

export default repository;
