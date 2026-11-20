import type { RouteType } from '@/lib/constants/routes';
import type { Middleware } from '@/lib/types/route';
import { RouteError } from '../response';

export function expired<K extends RouteType>(): Middleware<K> {
  return async (context, next) => {
    if (context.config.expiredAt && context.now >= context.config.expiredAt) {
      throw new RouteError(410, 'routes.ROUTE_EXPIRED');
    }

    await next();
  };
}
