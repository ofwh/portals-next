import { ArrowRightLeft, DatabaseZap, FileCodeCorner, Gauge, Navigation, Rss, Settings, UserRound } from 'lucide-react';

export const navigationGroups = [
  {
    label: 'dashboards',
    items: [{ label: 'dashboard', href: '/dashboard', icon: Gauge }],
  },
  {
    label: 'routes',
    items: [
      { label: 'proxies', href: '/routes/proxies', icon: ArrowRightLeft },
      { label: 'redirects', href: '/routes/redirects', icon: Navigation },
      { label: 'caches', href: '/routes/caches', icon: DatabaseZap },
      { label: 'originals', href: '/routes/originals', icon: FileCodeCorner },
    ],
  },
  {
    label: 'application',
    items: [{ label: 'subscriptions', href: '/application/subscriptions', icon: Rss }],
  },
  {
    label: 'settings',
    items: [
      { label: 'account', href: '/settings/account', icon: UserRound },
      { label: 'system', href: '/settings/system', icon: Settings },
    ],
  },
] as const;

export function isNavigationActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
