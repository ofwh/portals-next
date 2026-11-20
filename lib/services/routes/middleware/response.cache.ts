import type { Middleware } from '@/lib/types/route';
import { sanitize } from './response.proxy';

export function cache(): Middleware<'caches'> {
  return async (context, next) => {
    const snapshot = context.snapshot;

    if (!snapshot) {
      throw new Error();
    }

    context.response = new Response([204, 205, 304].includes(snapshot.status) ? null : new Uint8Array(snapshot.body), {
      status: snapshot.status,
      statusText: snapshot.statusText,
      headers: sanitize(new Headers(snapshot.headers)),
    });
    await next();
  };
}
