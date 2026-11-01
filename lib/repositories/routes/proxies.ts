import { and, count, desc, eq, or, sql } from 'drizzle-orm';
import 'server-only';
import { ROUTE_TYPE } from '@/lib/constants';
import { db } from '@/lib/db';
import { proxies } from '@/lib/db/schema';
import type { Pagination } from '@/lib/types/pagination';
import type { ProxyListParams } from '@/lib/types/routes';
import type { TagOption } from '@/lib/types/tag';
import { attachTags, findTagIds as findConfiguredTagIds, replaceTags } from '../tag-configs';

export type ProxyRow = typeof proxies.$inferSelect;
export type ProxyValues = Omit<typeof proxies.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> & { tagIds?: string[] };

export function pagination({
  page,
  size,
  search,
  status,
}: ProxyListParams): Pagination<ProxyRow & { tags: TagOption[] }> {
  const where = and(
    search
      ? or(
          sql`instr(lower(${proxies.name}), lower(${search})) > 0`,
          sql`instr(lower(${proxies.pathname}), lower(${search})) > 0`,
          sql`instr(lower(${proxies.url}), lower(${search})) > 0`,
        )
      : undefined,
    status && status !== 'all' ? eq(proxies.status, status === 'enabled') : undefined,
  );

  return db.transaction((tx) => {
    const total = tx.select({ value: count() }).from(proxies).where(where).get()?.value ?? 0;
    const data = tx
      .select()
      .from(proxies)
      .where(where)
      .orderBy(desc(proxies.updatedAt), desc(proxies.id))
      .limit(size)
      .offset((page - 1) * size)
      .all();

    return { data: attachTags(tx, ROUTE_TYPE.PROXY, data), total, page, size };
  });
}

export function findById(id: string): ProxyRow | undefined {
  return db.select().from(proxies).where(eq(proxies.id, id)).get();
}

export function findByPath(pathname: string): ProxyRow | undefined {
  return db.select().from(proxies).where(eq(proxies.pathname, pathname)).get();
}

export function create(values: ProxyValues): ProxyRow {
  const { tagIds, ...data } = values;

  return db.transaction((tx) => {
    const row = tx.insert(proxies).values(data).returning().get();

    if (tagIds !== undefined) {
      replaceTags(tx, ROUTE_TYPE.PROXY, row.id, tagIds);
    }

    return row;
  });
}

export function update(id: string, values: Partial<ProxyValues>): ProxyRow | undefined {
  const { tagIds, ...data } = values;

  return db.transaction((tx) => {
    const row = tx
      .update(proxies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(proxies.id, id))
      .returning()
      .get();

    if (row && tagIds !== undefined) {
      replaceTags(tx, ROUTE_TYPE.PROXY, row.id, tagIds);
    }

    return row;
  });
}

export function findTagIds(id: string): string[] {
  return findConfiguredTagIds(ROUTE_TYPE.PROXY, id);
}

export function remove(id: string): ProxyRow | undefined {
  return db.transaction((tx) => {
    const row = tx.delete(proxies).where(eq(proxies.id, id)).returning().get();

    if (row) {
      replaceTags(tx, ROUTE_TYPE.PROXY, id, []);
    }

    return row;
  });
}

const repository = { pagination, findById, findByPath, findTagIds, create, update, remove };

export default repository;
