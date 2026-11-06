import 'server-only';
import { ROUTE_TYPE } from '@/lib/constants';
import originals from '@/lib/repositories/originals';
import type { ConsumerRequest } from '@/lib/types/route';
import { originals as consumer } from './consumers/originals';
import { createRouteService } from './service';
import { validateOriginal } from './validation';

const service = createRouteService(ROUTE_TYPE.ORIGINAL, originals, validateOriginal, {
  notFound: 'routes.ORIGINAL_NOT_FOUND',
  pathExist: 'routes.ORIGINAL_PATH_EXIST',
});

export const { list, get, update, remove } = service;

export function handle(input: ConsumerRequest): Promise<Response> {
  return consumer.handle(input);
}

const routeService = { ...service, handle };

export default routeService;
