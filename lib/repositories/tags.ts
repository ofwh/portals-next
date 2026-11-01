import { and, count, desc, eq, inArray, sql } from 'drizzle-orm';
import 'server-only';
import { db } from '@/lib/db';
import { tags } from '@/lib/db/schema';
import type { Pagination } from '@/lib/types/pagination';
import type { TagListParams } from '@/lib/types/tag';

export type TagRow = Omit<typeof tags.$inferSelect, 'border'>;
export type TagValues = Omit<TagRow, 'id' | 'createdAt' | 'updatedAt'>;

const columns = {
  id: tags.id,
  group: tags.group,
  label: tags.label,
  color: tags.color,
  bgColor: tags.bgColor,
  rounded: tags.rounded,
  createdAt: tags.createdAt,
  updatedAt: tags.updatedAt,
};

export function pagination({ page, size, group, search }: TagListParams): Pagination<TagRow> {
  const where = and(
    group === undefined ? undefined : eq(tags.group, group),
    search ? sql`instr(lower(${tags.label}), lower(${search})) > 0` : undefined,
  );

  return db.transaction((tx) => {
    const total = tx.select({ value: count() }).from(tags).where(where).get()?.value ?? 0;
    const data = tx
      .select(columns)
      .from(tags)
      .where(where)
      .orderBy(desc(tags.updatedAt), desc(tags.id))
      .limit(size)
      .offset((page - 1) * size)
      .all();

    return { data, total, page, size };
  });
}

export function findById(id: string): TagRow | undefined {
  return db.select(columns).from(tags).where(eq(tags.id, id)).get();
}

export function findByIds(ids: string[]): TagRow[] {
  return ids.length ? db.select(columns).from(tags).where(inArray(tags.id, ids)).all() : [];
}

export function create(values: TagValues): TagRow {
  return db.insert(tags).values(values).returning(columns).get();
}

export function update(id: string, values: Partial<TagValues>): TagRow | undefined {
  return db
    .update(tags)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(tags.id, id))
    .returning(columns)
    .get();
}

export function remove(id: string): TagRow | undefined {
  return db.delete(tags).where(eq(tags.id, id)).returning(columns).get();
}

const repository = { pagination, findById, findByIds, create, update, remove };

export default repository;
