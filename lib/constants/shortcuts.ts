import type { RouteMode } from '@/lib/constants/routes';
import type { ShortcutInput, ShortcutType } from '@/lib/types/shortcuts';
import { ROUTE_TYPE } from './routes';

export const DEFAULT_SHORTCUTS = {
  proxy: { pathname: '/p', status: true },
  redirect: { pathname: '/r', status: true },
  cache: { pathname: '/c', status: true },
  original: { pathname: '/o', status: true },
} as const satisfies Record<ShortcutType, Pick<ShortcutInput, 'pathname' | 'status'>>;

export const SHORTCUT_ROUTES = {
  proxy: ROUTE_TYPE.PROXY,
  redirect: ROUTE_TYPE.REDIRECT,
  cache: ROUTE_TYPE.CACHE,
  original: ROUTE_TYPE.ORIGINAL,
} as const satisfies Record<ShortcutType, RouteMode>;
