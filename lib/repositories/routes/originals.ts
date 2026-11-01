import { and, count, desc, eq, or, sql } from 'drizzle-orm';
import 'server-only';
import { ROUTE_TYPE } from '@/lib/constants';
import { db } from '@/lib/db';
import { originals } from '@/lib/db/schema';
import type { Pagination } from '@/lib/types/pagination';
import type { OriginalListParams } from '@/lib/types/routes';
import type { TagOption } from '@/lib/types/tag';
import { attachTags, findTagIds as findConfiguredTagIds, replaceTags } from '../tag-configs';

export type OriginalRow = typeof originals.$inferSelect;
export type OriginalValues = Omit<typeof originals.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> & {
  tagIds?: string[];
};

export function pagination({
  page,
  size,
  search,
  status,
}: OriginalListParams): Pagination<OriginalRow & { tags: TagOption[] }> {
  const where = and(
    search
      ? or(
          sql`instr(lower(${originals.name}), lower(${search})) > 0`,
          sql`instr(lower(${originals.pathname}), lower(${search})) > 0`,
          sql`instr(lower(${originals.contentType}), lower(${search})) > 0`,
        )
      : undefined,
    status && status !== 'all' ? eq(originals.status, status === 'enabled') : undefined,
  );

  return db.transaction((tx) => {
    const total = tx.select({ value: count() }).from(originals).where(where).get()?.value ?? 0;
    const data = tx
      .select()
      .from(originals)
      .where(where)
      .orderBy(desc(originals.updatedAt), desc(originals.id))
      .limit(size)
      .offset((page - 1) * size)
      .all();

    return { data: attachTags(tx, ROUTE_TYPE.ORIGINAL, data), total, page, size };
  });
}

export function findById(id: string): OriginalRow | undefined {
  return db.select().from(originals).where(eq(originals.id, id)).get();
}

export function findByPath(pathname: string): OriginalRow | undefined {
  return db.select().from(originals).where(eq(originals.pathname, pathname)).get();
}

export function create(values: OriginalValues): OriginalRow {
  const { tagIds, ...data } = values;

  return db.transaction((tx) => {
    const row = tx.insert(originals).values(data).returning().get();

    if (tagIds !== undefined) {
      replaceTags(tx, ROUTE_TYPE.ORIGINAL, row.id, tagIds);
    }

    return row;
  });
}

export function update(id: string, values: Partial<OriginalValues>): OriginalRow | undefined {
  const { tagIds, ...data } = values;

  return db.transaction((tx) => {
    const row = tx
      .update(originals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(originals.id, id))
      .returning()
      .get();

    if (row && tagIds !== undefined) {
      replaceTags(tx, ROUTE_TYPE.ORIGINAL, row.id, tagIds);
    }

    return row;
  });
}

export function findTagIds(id: string): string[] {
  return findConfiguredTagIds(ROUTE_TYPE.ORIGINAL, id);
}

export function remove(id: string): OriginalRow | undefined {
  return db.transaction((tx) => {
    const row = tx.delete(originals).where(eq(originals.id, id)).returning().get();

    if (row) {
      replaceTags(tx, ROUTE_TYPE.ORIGINAL, id, []);
    }

    return row;
  });
}

const repository = { pagination, findById, findByPath, findTagIds, create, update, remove };

export default repository;
