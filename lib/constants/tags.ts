import { ROUTE_TYPE } from './routes';

export const ROUTE_TAG_GROUPS = [
  { label: 'admin.sidebar.proxies', value: ROUTE_TYPE.PROXY },
  { label: 'admin.sidebar.redirects', value: ROUTE_TYPE.REDIRECT },
  { label: 'admin.sidebar.caches', value: ROUTE_TYPE.CACHE },
  { label: 'admin.sidebar.originals', value: ROUTE_TYPE.ORIGINAL },
] as const;

export const SYSTEM_TAG_GROUPS = [] as const;

export const TAG_GROUPS = [...ROUTE_TAG_GROUPS, ...SYSTEM_TAG_GROUPS] as const;
