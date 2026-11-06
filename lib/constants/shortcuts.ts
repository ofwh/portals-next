import type { RouteType } from '@/lib/constants/routes';
import { ROUTE_TYPE } from './routes';

export const SHORTCUT_ROUTES = {
  proxy: ROUTE_TYPE.PROXY,
  redirect: ROUTE_TYPE.REDIRECT,
  cache: ROUTE_TYPE.CACHE,
  original: ROUTE_TYPE.ORIGINAL,
} as const satisfies Record<string, RouteType>;

export const DEFAULT_SHORTCUTS = {
  proxy: { pathname: '/p', status: true },
  redirect: { pathname: '/r', status: true },
  cache: { pathname: '/c', status: true },
  original: { pathname: '/o', status: true },
} as const satisfies Record<keyof typeof SHORTCUT_ROUTES, { pathname: string; status: boolean }>;
