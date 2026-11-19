export const ROUTE_TYPE = {
  PROXY: 'proxies',
  REDIRECT: 'redirects',
  CACHE: 'caches',
  ORIGINAL: 'originals',
  SUBSCRIPTION: 'subscriptions',
} as const;

export type RouteType = (typeof ROUTE_TYPE)[keyof typeof ROUTE_TYPE];
export type RouteMode = Exclude<RouteType, 'subscriptions'>;

export const ROUTE_TYPES = [ROUTE_TYPE.PROXY, ROUTE_TYPE.REDIRECT, ROUTE_TYPE.CACHE, ROUTE_TYPE.ORIGINAL] as const;

export const ROUTE_MODE_OPTIONS = [
  { label: 'admin.sidebar.proxies', value: ROUTE_TYPE.PROXY },
  { label: 'admin.sidebar.redirects', value: ROUTE_TYPE.REDIRECT },
  { label: 'admin.sidebar.caches', value: ROUTE_TYPE.CACHE },
  { label: 'admin.sidebar.originals', value: ROUTE_TYPE.ORIGINAL },
] as const;
