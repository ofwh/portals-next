import type { AnalyticsGranularity, AnalyticsLimit, AnalyticsRanking, AnalyticsTotals } from '@/lib/types/analytics';
import type { DashboardCategory, DashboardOverview, DashboardWindow } from '@/lib/types/dashboard';
import { request } from './request';

export function getOverview(params: Record<string, never>, signal?: AbortSignal) {
  return request<DashboardOverview>('/api/dashboard/overview', params, signal);
}

export function getTotals(params: DashboardWindow & { granularity: AnalyticsGranularity }, signal?: AbortSignal) {
  return request<AnalyticsTotals>('/api/analytics/totals', params, signal);
}

export function getRanking(
  { category, ...params }: DashboardWindow & { category: DashboardCategory; limit: AnalyticsLimit },
  signal?: AbortSignal,
) {
  return request<AnalyticsRanking>(
    '/api/analytics/ranking',
    { ...params, ...(category === 'all' ? {} : { routeType: category }) },
    signal,
  );
}
