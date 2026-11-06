import 'server-only';
import { ROUTE_TYPE, ROUTE_TYPES } from '@/lib/constants';
import caches from './caches';
import originals from './originals';
import proxies from './proxies';
import redirects from './redirects';
import * as v from '../shared/validation';

const services = {
  [ROUTE_TYPE.PROXY]: proxies,
  [ROUTE_TYPE.REDIRECT]: redirects,
  [ROUTE_TYPE.CACHE]: caches,
  [ROUTE_TYPE.ORIGINAL]: originals,
};

function selectService(input: unknown) {
  const { type, ...params } = v.record(input);

  return { service: services[v.choice(type, ROUTE_TYPES)], params };
}

export function list(input: unknown) {
  const { service, params } = selectService(input);

  return service.list(params);
}

export function detail(input: unknown) {
  const { service, params } = selectService(input);

  return service.get(params);
}

export function update(input: unknown) {
  const { service, params } = selectService(input);

  return service.update(params);
}

export function remove(input: unknown) {
  const { service, params } = selectService(input);

  return service.remove(params);
}

const service = { list, detail, update, remove };

export default service;
