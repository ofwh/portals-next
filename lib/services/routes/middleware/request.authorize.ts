import { timingSafeEqual } from 'node:crypto';
import type { RouteType } from '@/lib/constants/routes';
import type { Middleware } from '@/lib/types/route';
import { RouteError } from '../response';

export function authorize<K extends RouteType>(): Middleware<K> {
  return async (context, next) => {
    if (!context.parameters) {
      throw new Error();
    }

    const expected = context.config.token;
    const token = context.parameters.query.token;

    if (expected) {
      const actual = typeof token === 'string' ? Buffer.from(token) : null;
      const target = Buffer.from(expected);

      if (!actual || actual.length !== target.length || !timingSafeEqual(actual, target)) {
        throw new RouteError(401, 'routes.TOKEN_INVALID');
      }
    }

    await next();
  };
}
