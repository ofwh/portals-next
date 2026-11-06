import { parseHeaders } from '@/lib/shared/headers';
import type { ForwardMode, Middleware } from '@/lib/types/route';
import { sanitize } from './response.proxy';

export function headers<K extends ForwardMode>(): Middleware<K> {
  return async (context, next) => {
    if (!context.outbound) {
      throw new Error();
    }

    const headers = sanitize(new Headers(parseHeaders(context.config.headers)));
    const types = {
      JSON: 'application/json',
      TEXT: 'text/plain; charset=utf-8',
      FORM: 'application/x-www-form-urlencoded',
    };

    headers.delete('host');
    headers.delete('content-length');
    if (context.config.method === 'POST' && !headers.has('content-type')) {
      headers.set('content-type', types[context.config.format]);
    }

    context.outbound.headers = headers;
    await next();
  };
}
