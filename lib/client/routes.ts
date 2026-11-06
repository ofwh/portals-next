import { ROUTE_TYPE } from '@/lib/constants';
import type { RouteMode } from '@/lib/constants/routes';
import type { Pagination } from '@/lib/types/pagination';
import type {
  CacheDetail,
  CacheListItem,
  CacheUpdateInput,
  OriginalDetail,
  OriginalListItem,
  OriginalUpdateInput,
  ProxyDetail,
  ProxyListItem,
  ProxyUpdateInput,
  RedirectDetail,
  RedirectListItem,
  RedirectUpdateInput,
  RouteListParams,
} from '@/lib/types/routes';
import { request } from './request';

function createRouteClient<Item, Detail, Input>(type: RouteMode) {
  return {
    async update(input: Input): Promise<void> {
      await request<unknown>('/api/routes/update', { ...input, type });
    },
    detail(id: string, signal: AbortSignal) {
      return request<Detail>('/api/routes/detail', { id, type }, signal);
    },
    async remove(id: string): Promise<void> {
      await request<{ id: string }>('/api/routes/remove', { id, type });
    },
    list(params: RouteListParams, signal: AbortSignal) {
      return request<Pagination<Item>>('/api/routes/list', { ...params, type }, signal);
    },
  };
}

export const {
  update: updateProxy,
  detail: getProxy,
  remove: removeProxy,
  list: listProxies,
} = createRouteClient<ProxyListItem, ProxyDetail, ProxyUpdateInput>(ROUTE_TYPE.PROXY);

export const {
  update: updateRedirect,
  detail: getRedirect,
  remove: removeRedirect,
  list: listRedirects,
} = createRouteClient<RedirectListItem, RedirectDetail, RedirectUpdateInput>(ROUTE_TYPE.REDIRECT);

export const {
  update: updateCache,
  detail: getCache,
  remove: removeCache,
  list: listCaches,
} = createRouteClient<CacheListItem, CacheDetail, CacheUpdateInput>(ROUTE_TYPE.CACHE);

export const {
  update: updateOriginal,
  detail: getOriginal,
  remove: removeOriginal,
  list: listOriginals,
} = createRouteClient<OriginalListItem, OriginalDetail, OriginalUpdateInput>(ROUTE_TYPE.ORIGINAL);
