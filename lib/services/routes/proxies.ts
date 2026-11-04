import 'server-only';
import { ROUTE_TYPE } from '@/lib/constants';
import proxies from '@/lib/repositories/proxies';
import { createRouteService } from './service';
import { validateProxy } from './validation';

const service = createRouteService(ROUTE_TYPE.PROXY, proxies, validateProxy, {
  notFound: 'routes.PROXY_NOT_FOUND',
  pathExist: 'routes.PROXY_PATH_EXIST',
});

export const { list, get, update, remove } = service;

export default service;
