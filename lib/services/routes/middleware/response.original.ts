import type { Middleware } from '@/lib/types/route';

export function original(): Middleware<'originals'> {
  return async (context, next) => {
    context.response = new Response(context.config.content, {
      headers: { 'content-type': context.config.contentType },
    });
    await next();
  };
}
