import type { RouteType } from '@/lib/constants/routes';
import type { Middleware } from '@/lib/types/route';

export function expired<K extends RouteType>(): Middleware<K> {
  return async (context, next) => {
    if (context.config.expiredAt && context.now >= context.config.expiredAt) {
      throw Object.assign(new Error(), { status: 410 });
    }

    await next();
  };
}
