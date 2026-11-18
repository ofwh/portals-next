import 'server-only';
import { ANALYTICS_BUCKET_MS, ANALYTICS_ROUTE_TYPES } from '@/lib/constants/analytics';
import repository from '@/lib/repositories/analytics';
import type { AnalyticsRow } from '@/lib/repositories/analytics';
import type { AnalyticsRanking, AnalyticsSeriesPoint, AnalyticsTotals } from '@/lib/types/analytics';
import { normalizeIp, parseUa } from './client-info';
import * as v from './validation';

export function record(input: unknown): AnalyticsRow | undefined {
  const event = v.event(input);

  return repository.create({ ...event, ...parseUa(event.ua), ip: normalizeIp(event.ip) });
}

export function totals(input: unknown): AnalyticsTotals {
  const params = v.totals(input);
  const rows = repository.series(params);
  const bucketMs = ANALYTICS_BUCKET_MS[params.granularity];
  const buckets = new Map<number, AnalyticsSeriesPoint>();
  const totals = ANALYTICS_ROUTE_TYPES.map((routeType) => ({ routeType, totalRequests: 0 }));

  for (
    let time = Math.floor(params.from.getTime() / bucketMs) * bucketMs;
    time < params.to.getTime();
    time += bucketMs
  ) {
    buckets.set(time, {
      date: new Date(time).toISOString(),
      proxies: 0,
      redirects: 0,
      caches: 0,
      originals: 0,
      subscriptions: 0,
    });
  }

  for (const row of rows) {
    const point = buckets.get(row.bucket);
    const total = totals.find((item) => item.routeType === row.routeType);

    if (point && total) {
      point[row.routeType] = row.count;
      total.totalRequests += row.count;
    }
  }

  return {
    from: params.from.toISOString(),
    to: params.to.toISOString(),
    granularity: params.granularity,
    totals,
    totalRequests: totals.reduce((sum, item) => sum + item.totalRequests, 0),
    series: [...buckets.values()],
  };
}

export function ranking(input: unknown): AnalyticsRanking {
  const params = v.ranking(input);

  return { from: params.from.toISOString(), to: params.to.toISOString(), ranking: repository.ranking(params) };
}

const service = { record, totals, ranking };

export default service;
