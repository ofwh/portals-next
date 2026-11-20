import type { RouteType } from '@/lib/constants/routes';

export interface DashboardCount {
  routeType: RouteType;
  total: number;
  enabled: number;
  disabled: number;
}

export interface DashboardCard extends DashboardCount {
  entryEnabled: boolean;
}

export interface DashboardOverview {
  cards: DashboardCard[];
}

export type DashboardTimeRange = '24h' | '7d' | '30d' | '90d';
export type DashboardCategory = 'all' | RouteType;

export interface DashboardWindow {
  from: number;
  to: number;
}

export interface DashboardQuery<Result> {
  data: Result | null;
  loading: boolean;
  stale: boolean;
  error: string | null;
  retry: () => void;
}
