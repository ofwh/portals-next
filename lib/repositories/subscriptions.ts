import { and, count, desc, eq, or, sql } from 'drizzle-orm';
import 'server-only';
import { SUBSCRIPTION_TAG_GROUP } from '@/lib/constants/tags';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import type { Pagination } from '@/lib/types/pagination';
import type { SubscriptionListParams } from '@/lib/types/subscriptions';
import type { TagOption } from '@/lib/types/tag';
import { attachTags, findTagIds as findConfiguredTagIds, replaceTags } from './tag-configs';

export type SubscriptionRow = typeof subscriptions.$inferSelect;
export type SubscriptionValues = Omit<typeof subscriptions.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> & {
  tagIds?: string[];
};

export function pagination({
  page,
  size,
  search,
  status,
}: SubscriptionListParams): Pagination<SubscriptionRow & { tags: TagOption[] }> {
  const where = and(
    search
      ? or(
          sql`instr(lower(${subscriptions.name}), lower(${search})) > 0`,
          sql`instr(lower(${subscriptions.pathname}), lower(${search})) > 0`,
        )
      : undefined,
    status && status !== 'all' ? eq(subscriptions.status, status === 'enabled') : undefined,
  );

  return db.transaction((tx) => {
    const total = tx.select({ value: count() }).from(subscriptions).where(where).get()?.value ?? 0;
    const data = tx
      .select()
      .from(subscriptions)
      .where(where)
      .orderBy(desc(subscriptions.updatedAt), desc(subscriptions.id))
      .limit(size)
      .offset((page - 1) * size)
      .all();

    return { data: attachTags(tx, SUBSCRIPTION_TAG_GROUP, data), total, page, size };
  });
}

export function findById(id: string): SubscriptionRow | undefined {
  return db.select().from(subscriptions).where(eq(subscriptions.id, id)).get();
}

export function findByPath(pathname: string): SubscriptionRow | undefined {
  return db.select().from(subscriptions).where(eq(subscriptions.pathname, pathname)).get();
}

export function create(values: SubscriptionValues, id = crypto.randomUUID()): SubscriptionRow {
  const { tagIds, ...data } = values;

  return db.transaction((tx) => {
    const row = tx
      .insert(subscriptions)
      .values({ ...data, id })
      .returning()
      .get();

    if (tagIds !== undefined) {
      replaceTags(tx, SUBSCRIPTION_TAG_GROUP, row.id, tagIds);
    }

    return row;
  });
}

export function update(id: string, values: Partial<SubscriptionValues>): SubscriptionRow | undefined {
  const { tagIds, ...data } = values;

  return db.transaction((tx) => {
    const row = tx
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning()
      .get();

    if (row && tagIds !== undefined) {
      replaceTags(tx, SUBSCRIPTION_TAG_GROUP, row.id, tagIds);
    }

    return row;
  });
}

export function findTagIds(id: string): string[] {
  return findConfiguredTagIds(SUBSCRIPTION_TAG_GROUP, id);
}

export function remove(id: string): SubscriptionRow | undefined {
  return db.transaction((tx) => {
    const row = tx.delete(subscriptions).where(eq(subscriptions.id, id)).returning().get();

    if (row) {
      replaceTags(tx, SUBSCRIPTION_TAG_GROUP, id, []);
    }

    return row;
  });
}

const repository = { pagination, findById, findByPath, findTagIds, create, update, remove };

export default repository;
