import { and, count, desc, eq, or, sql } from 'drizzle-orm';
import 'server-only';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import type { Pagination } from '@/lib/types/pagination';
import type { SubscriptionListParams } from '@/lib/types/subscriptions';

export type SubscriptionRow = typeof subscriptions.$inferSelect;
export type SubscriptionValues = Omit<typeof subscriptions.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;

export function pagination({ page, size, search, status }: SubscriptionListParams): Pagination<SubscriptionRow> {
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

    return { data, total, page, size };
  });
}

export function findById(id: string): SubscriptionRow | undefined {
  return db.select().from(subscriptions).where(eq(subscriptions.id, id)).get();
}

export function findByPath(pathname: string): SubscriptionRow | undefined {
  return db.select().from(subscriptions).where(eq(subscriptions.pathname, pathname)).get();
}

export function create(values: SubscriptionValues): SubscriptionRow {
  return db.insert(subscriptions).values(values).returning().get();
}

export function update(id: string, values: Partial<SubscriptionValues>): SubscriptionRow | undefined {
  return db
    .update(subscriptions)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(subscriptions.id, id))
    .returning()
    .get();
}

export function remove(id: string): SubscriptionRow | undefined {
  return db.delete(subscriptions).where(eq(subscriptions.id, id)).returning().get();
}

const repository = { pagination, findById, findByPath, create, update, remove };

export default repository;
