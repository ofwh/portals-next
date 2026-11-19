import { count, sql } from 'drizzle-orm';
import 'server-only';
import { ANALYTICS_ROUTE_TYPES } from '@/lib/constants/analytics';
import { db } from '@/lib/db';
import { caches, originals, proxies, redirects, subscriptions } from '@/lib/db/schema';
import type { DashboardCount } from '@/lib/types/dashboard';

const TABLES = { proxies, redirects, caches, originals, subscriptions };

export function overview(): DashboardCount[] {
  return db.transaction((tx) =>
    ANALYTICS_ROUTE_TYPES.map((routeType) => {
      const table = TABLES[routeType];
      const row = tx
        .select({
          total: count(),
          enabled: sql<number>`coalesce(sum(case when ${table.status} = 1 then 1 else 0 end), 0)`.mapWith(Number),
        })
        .from(table)
        .get();
      const total = row?.total ?? 0;
      const enabled = row?.enabled ?? 0;

      return { routeType, total, enabled, disabled: total - enabled };
    }),
  );
}

const repository = { overview };

export default repository;
