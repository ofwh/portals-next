import type { ConfigMap, ForwardMode, Middleware } from '@/lib/types/route';

export function apply(_req: Request, response: Response, cors: ConfigMap['proxies']['cors']): Response {
  if (cors === -1) {
    return response;
  }

  const headers = new Headers(response.headers);

  for (const name of [...headers.keys()]) {
    if (name.toLowerCase().startsWith('access-control-')) {
      headers.delete(name);
    }
  }
  if (cors === 1) {
    headers.set('access-control-allow-origin', '*');
  }

  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function cors<K extends ForwardMode>(): Middleware<K> {
  return async (context, next) => {
    if (!context.response) {
      throw new Error();
    }

    context.response = apply(context.req, context.response, context.config.cors);
    await next();
  };
}
