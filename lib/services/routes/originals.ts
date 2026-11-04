import 'server-only';
import { ROUTE_TYPE } from '@/lib/constants';
import originals from '@/lib/repositories/originals';
import { createRouteService } from './service';
import { validateOriginal } from './validation';

const service = createRouteService(ROUTE_TYPE.ORIGINAL, originals, validateOriginal, {
  notFound: 'routes.ORIGINAL_NOT_FOUND',
  pathExist: 'routes.ORIGINAL_PATH_EXIST',
});

export const { list, get, update, remove } = service;

export default service;
