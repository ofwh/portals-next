import 'server-only';
import { ROUTE_TYPE } from '@/lib/constants';
import caches from '@/lib/repositories/caches';
import { createRouteService } from './service';
import { validateCache } from './validation';

const service = createRouteService(ROUTE_TYPE.CACHE, caches, validateCache, {
  notFound: 'routes.CACHE_NOT_FOUND',
  pathExist: 'routes.CACHE_PATH_EXIST',
});

export const { list, get, update, remove } = service;

export default service;
