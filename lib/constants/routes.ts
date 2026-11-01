export const ROUTE_TYPE = {
  PROXY: 'proxies',
  REDIRECT: 'redirects',
  CACHE: 'caches',
  ORIGINAL: 'originals',
} as const;

export type RouteMode = (typeof ROUTE_TYPE)[keyof typeof ROUTE_TYPE];

export const ROUTE_TYPES = Object.values(ROUTE_TYPE);
