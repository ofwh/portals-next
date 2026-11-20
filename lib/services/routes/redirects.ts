import 'server-only';
import { ROUTE_TYPE } from '@/lib/constants';
import redirects from '@/lib/repositories/redirects';
import type { ConsumerRequest } from '@/lib/types/route';
import { redirects as consumer } from './consumers/redirects';
import { createRouteService } from './service';
import { validateRedirect } from './validation';

const service = createRouteService(ROUTE_TYPE.REDIRECT, redirects, validateRedirect, {
  notFound: 'routes.REDIRECT_NOT_FOUND',
  pathExist: 'routes.REDIRECT_PATH_EXIST',
});

export const { list, get, update, remove } = service;

export function handle(input: ConsumerRequest): Promise<Response> {
  return consumer.handle(input);
}

const routeService = { ...service, handle };

export default routeService;
