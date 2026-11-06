import type { Middleware } from '@/lib/types/route';

export function redirect(): Middleware<'redirects'> {
  return async (context, next) => {
    context.response = new Response(null, {
      status: context.config.statusCode,
      headers: { location: context.config.url },
    });
    await next();
  };
}
