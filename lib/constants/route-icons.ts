import { ArrowRightLeft, DatabaseZap, FileCodeCorner, Navigation, Rss } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { RouteType } from './routes';

export const ROUTE_ICONS = {
  proxies: ArrowRightLeft,
  redirects: Navigation,
  caches: DatabaseZap,
  originals: FileCodeCorner,
  subscriptions: Rss,
} satisfies Record<RouteType, LucideIcon>;
