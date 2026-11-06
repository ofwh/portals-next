export const ROUTE_TYPE = {
  PROXY: 'proxies',
  REDIRECT: 'redirects',
  CACHE: 'caches',
  ORIGINAL: 'originals',
} as const;

export type RouteType = (typeof ROUTE_TYPE)[keyof typeof ROUTE_TYPE];
export type RouteMode = RouteType;

export const ROUTE_TYPES = [ROUTE_TYPE.PROXY, ROUTE_TYPE.REDIRECT, ROUTE_TYPE.CACHE, ROUTE_TYPE.ORIGINAL] as const;
