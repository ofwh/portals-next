import 'server-only';
import { ROUTE_TYPE } from '@/lib/constants';
import caches from '@/lib/repositories/caches';
import type { ConsumerRequest } from '@/lib/types/route';
import { caches as consumer } from './consumers/caches';
import { createRouteService } from './service';
import { validateCache } from './validation';
import * as v from '../shared/validation';

const service = createRouteService(ROUTE_TYPE.CACHE, caches, validateCache, {
  notFound: 'routes.CACHE_NOT_FOUND',
  pathExist: 'routes.CACHE_PATH_EXIST',
});

export const { list, get } = service;

export async function update(input: unknown) {
  const params = v.record(input);
  const existing = params.id === undefined ? undefined : service.get({ id: params.id });
  const row = service.update(input);

  if (existing) {
    await consumer.invalidate(existing);
  }

  return row;
}

export async function remove(input: unknown) {
  const existing = service.get(input);
  const result = service.remove(input);

  await consumer.invalidate(existing);

  return result;
}

export function handle(input: ConsumerRequest): Promise<Response> {
  return consumer.handle(input);
}

const routeService = { ...service, update, remove, handle };

export default routeService;
