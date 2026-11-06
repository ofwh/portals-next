import { timingSafeEqual } from 'node:crypto';
import type { RouteType } from '@/lib/constants/routes';
import type { Middleware } from '@/lib/types/route';

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
        throw Object.assign(new Error(), { status: 401 });
      }
    }

    await next();
  };
}
