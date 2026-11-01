import { and, count, desc, eq, or, sql } from 'drizzle-orm';
import 'server-only';
import { ROUTE_TYPE } from '@/lib/constants';
import { db } from '@/lib/db';
import { caches } from '@/lib/db/schema';
import type { Pagination } from '@/lib/types/pagination';
import type { CacheListParams } from '@/lib/types/routes';
import type { TagOption } from '@/lib/types/tag';
import { attachTags, findTagIds as findConfiguredTagIds, replaceTags } from '../tag-configs';

export type CacheRow = typeof caches.$inferSelect;
export type CacheValues = Omit<typeof caches.$inferInsert, 'id' | 'createdAt' | 'updatedAt' | 'cachedAt'> & {
  tagIds?: string[];
};

export function pagination({
  page,
  size,
  search,
  status,
}: CacheListParams): Pagination<CacheRow & { tags: TagOption[] }> {
  const where = and(
    search
      ? or(
          sql`instr(lower(${caches.name}), lower(${search})) > 0`,
          sql`instr(lower(${caches.pathname}), lower(${search})) > 0`,
          sql`instr(lower(${caches.url}), lower(${search})) > 0`,
        )
      : undefined,
    status && status !== 'all' ? eq(caches.status, status === 'enabled') : undefined,
  );

  return db.transaction((tx) => {
    const total = tx.select({ value: count() }).from(caches).where(where).get()?.value ?? 0;
    const data = tx
      .select()
      .from(caches)
      .where(where)
      .orderBy(desc(caches.updatedAt), desc(caches.id))
      .limit(size)
      .offset((page - 1) * size)
      .all();

    return { data: attachTags(tx, ROUTE_TYPE.CACHE, data), total, page, size };
  });
}

export function findById(id: string): CacheRow | undefined {
  return db.select().from(caches).where(eq(caches.id, id)).get();
}

export function findByPath(pathname: string): CacheRow | undefined {
  return db.select().from(caches).where(eq(caches.pathname, pathname)).get();
}

export function create(values: CacheValues): CacheRow {
  const { tagIds, ...data } = values;

  return db.transaction((tx) => {
    const row = tx.insert(caches).values(data).returning().get();

    if (tagIds !== undefined) {
      replaceTags(tx, ROUTE_TYPE.CACHE, row.id, tagIds);
    }

    return row;
  });
}

export function update(id: string, values: Partial<CacheValues>): CacheRow | undefined {
  const { tagIds, ...data } = values;

  return db.transaction((tx) => {
    const row = tx
      .update(caches)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(caches.id, id))
      .returning()
      .get();

    if (row && tagIds !== undefined) {
      replaceTags(tx, ROUTE_TYPE.CACHE, row.id, tagIds);
    }

    return row;
  });
}

export function findTagIds(id: string): string[] {
  return findConfiguredTagIds(ROUTE_TYPE.CACHE, id);
}

export function remove(id: string): CacheRow | undefined {
  return db.transaction((tx) => {
    const row = tx.delete(caches).where(eq(caches.id, id)).returning().get();

    if (row) {
      replaceTags(tx, ROUTE_TYPE.CACHE, id, []);
    }

    return row;
  });
}

const repository = { pagination, findById, findByPath, findTagIds, create, update, remove };

export default repository;
