import { ROUTE_TYPE } from '@/lib/constants';
import type { RouteMode } from '@/lib/constants/routes';
import caches from './caches';
import originals from './originals';
import proxies from './proxies';
import redirects from './redirects';
import type { FormStrategy, RouteForms } from './strategy';

export type { RouteForms } from './strategy';

export const formStrategies: { [Type in RouteMode]: FormStrategy<RouteForms[Type]> } = {
  [ROUTE_TYPE.PROXY]: proxies,
  [ROUTE_TYPE.CACHE]: caches,
  [ROUTE_TYPE.REDIRECT]: redirects,
  [ROUTE_TYPE.ORIGINAL]: originals,
};
