import type { ANALYTICS_GRANULARITIES, ANALYTICS_LIMITS } from '@/lib/constants/analytics';
import type { RouteType } from '@/lib/constants/routes';

export type AnalyticsGranularity = (typeof ANALYTICS_GRANULARITIES)[number];
export type AnalyticsLimit = (typeof ANALYTICS_LIMITS)[number];

export interface AnalyticsRange {
  from: Date;
  to: Date;
}

export interface AnalyticsTotalsParams extends AnalyticsRange {
  granularity: AnalyticsGranularity;
}

export interface AnalyticsRankingParams extends AnalyticsRange {
  routeType?: RouteType;
  limit: AnalyticsLimit;
}

export interface AnalyticsEvent {
  id?: string;
  requestId: string;
  visitAt: Date;
  routeType: RouteType;
  url: string;
  pathname: string;
  ua?: string | null;
  ip?: string | null;
  duration: number;
  statusCode?: number | null;
  errorCode?: number | null;
}

export type AnalyticsSeriesPoint = { date: string } & Record<RouteType, number>;

export interface AnalyticsTotal {
  routeType: RouteType;
  totalRequests: number;
}

export interface AnalyticsTotals {
  from: string;
  to: string;
  granularity: AnalyticsGranularity;
  totals: AnalyticsTotal[];
  totalRequests: number;
  series: AnalyticsSeriesPoint[];
}

export interface AnalyticsRankingItem {
  routeType: RouteType;
  url: string;
  count: number;
}

export interface AnalyticsRanking {
  from: string;
  to: string;
  ranking: AnalyticsRankingItem[];
}
