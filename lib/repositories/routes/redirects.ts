import { and, count, desc, eq, or, sql } from 'drizzle-orm';
import 'server-only';
import { ROUTE_TYPE } from '@/lib/constants';
import { db } from '@/lib/db';
import { redirects } from '@/lib/db/schema';
import type { Pagination } from '@/lib/types/pagination';
import type { RedirectListParams } from '@/lib/types/routes';
import type { TagOption } from '@/lib/types/tag';
import { attachTags, findTagIds as findConfiguredTagIds, replaceTags } from '../tag-configs';

export type RedirectRow = typeof redirects.$inferSelect;
export type RedirectValues = Omit<typeof redirects.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> & {
  tagIds?: string[];
};

export function pagination({
  page,
  size,
  search,
  status,
}: RedirectListParams): Pagination<RedirectRow & { tags: TagOption[] }> {
  const where = and(
    search
      ? or(
          sql`instr(lower(${redirects.name}), lower(${search})) > 0`,
          sql`instr(lower(${redirects.pathname}), lower(${search})) > 0`,
          sql`instr(lower(${redirects.url}), lower(${search})) > 0`,
        )
      : undefined,
    status && status !== 'all' ? eq(redirects.status, status === 'enabled') : undefined,
  );

  return db.transaction((tx) => {
    const total = tx.select({ value: count() }).from(redirects).where(where).get()?.value ?? 0;
    const data = tx
      .select()
      .from(redirects)
      .where(where)
      .orderBy(desc(redirects.updatedAt), desc(redirects.id))
      .limit(size)
      .offset((page - 1) * size)
      .all();

    return { data: attachTags(tx, ROUTE_TYPE.REDIRECT, data), total, page, size };
  });
}

export function findById(id: string): RedirectRow | undefined {
  return db.select().from(redirects).where(eq(redirects.id, id)).get();
}

export function findByPath(pathname: string): RedirectRow | undefined {
  return db.select().from(redirects).where(eq(redirects.pathname, pathname)).get();
}

export function create(values: RedirectValues): RedirectRow {
  const { tagIds, ...data } = values;

  return db.transaction((tx) => {
    const row = tx.insert(redirects).values(data).returning().get();

    if (tagIds !== undefined) {
      replaceTags(tx, ROUTE_TYPE.REDIRECT, row.id, tagIds);
    }

    return row;
  });
}

export function update(id: string, values: Partial<RedirectValues>): RedirectRow | undefined {
  const { tagIds, ...data } = values;

  return db.transaction((tx) => {
    const row = tx
      .update(redirects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(redirects.id, id))
      .returning()
      .get();

    if (row && tagIds !== undefined) {
      replaceTags(tx, ROUTE_TYPE.REDIRECT, row.id, tagIds);
    }

    return row;
  });
}

export function findTagIds(id: string): string[] {
  return findConfiguredTagIds(ROUTE_TYPE.REDIRECT, id);
}

export function remove(id: string): RedirectRow | undefined {
  return db.transaction((tx) => {
    const row = tx.delete(redirects).where(eq(redirects.id, id)).returning().get();

    if (row) {
      replaceTags(tx, ROUTE_TYPE.REDIRECT, id, []);
    }

    return row;
  });
}

const repository = { pagination, findById, findByPath, findTagIds, create, update, remove };

export default repository;
