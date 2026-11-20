import { ANALYTICS_BUCKET_MS } from './analytics';
import type { RouteType } from './routes';

export const DASHBOARD_RANGES = ['24h', '7d', '30d', '90d'] as const;
export const DASHBOARD_RANGE_MS = {
  '24h': ANALYTICS_BUCKET_MS.day,
  '7d': 7 * ANALYTICS_BUCKET_MS.day,
  '30d': 30 * ANALYTICS_BUCKET_MS.day,
  '90d': 90 * ANALYTICS_BUCKET_MS.day,
} as const;
export const DASHBOARD_COLORS = {
  proxies: 'oklch(0.825 0.145 214.086)',
  redirects: 'oklch(0.696 0.167 249.172)',
  caches: 'oklch(0.647 0.262 0.287)',
  originals: 'oklch(0.84 0.172 84.076)',
  subscriptions: 'oklch(0.905 0.169 151.203)',
} as const satisfies Record<RouteType, string>;
