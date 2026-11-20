import { and, asc, count, desc, eq, gte, lt, sql } from 'drizzle-orm';
import 'server-only';
import { ANALYTICS_BUCKET_MS } from '@/lib/constants/analytics';
import { db } from '@/lib/db';
import { analytics } from '@/lib/db/schema';
import type { AnalyticsRankingItem, AnalyticsRankingParams, AnalyticsTotalsParams } from '@/lib/types/analytics';

export type AnalyticsRow = typeof analytics.$inferSelect;
export type AnalyticsValues = Omit<typeof analytics.$inferInsert, 'createdAt'>;

export function create(values: AnalyticsValues): AnalyticsRow | undefined {
  return db.insert(analytics).values(values).onConflictDoNothing({ target: analytics.id }).returning().get();
}

export function series({ from, to, granularity }: AnalyticsTotalsParams) {
  const bucketMs = ANALYTICS_BUCKET_MS[granularity];
  const bucket = sql<number>`cast(${analytics.visitAt} / ${bucketMs} as integer) * ${bucketMs}`;

  return db
    .select({ bucket, routeType: analytics.routeType, count: count() })
    .from(analytics)
    .where(and(gte(analytics.visitAt, from), lt(analytics.visitAt, to)))
    .groupBy(bucket, analytics.routeType)
    .orderBy(asc(bucket), asc(analytics.routeType))
    .all();
}

export function ranking({ from, to, routeType, limit }: AnalyticsRankingParams): AnalyticsRankingItem[] {
  const url = sql<string>`case when instr(${analytics.url}, '?') > 0 then substr(${analytics.url}, 1, instr(${analytics.url}, '?') - 1) else ${analytics.url} end`;
  const visits = count();

  return db
    .select({ routeType: analytics.routeType, url, count: visits })
    .from(analytics)
    .where(
      and(
        gte(analytics.visitAt, from),
        lt(analytics.visitAt, to),
        routeType ? eq(analytics.routeType, routeType) : undefined,
      ),
    )
    .groupBy(analytics.routeType, url)
    .orderBy(desc(visits), asc(url), asc(analytics.routeType))
    .limit(limit)
    .all();
}

const repository = { create, series, ranking };

export default repository;
