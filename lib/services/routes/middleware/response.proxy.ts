import type { Middleware } from '@/lib/types/route';

export function sanitize(input: Headers): Headers {
  const headers = new Headers(input);
  const connection = headers.get('connection')?.split(',') ?? [];

  for (const name of [
    ...connection,
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade',
  ]) {
    if (name.trim()) {
      headers.delete(name.trim());
    }
  }

  return headers;
}

export function create(upstream: Response): Response {
  const headers = sanitize(upstream.headers);

  const codings =
    headers
      .get('content-encoding')
      ?.toLowerCase()
      .split(',')
      .map((value) => value.trim()) ?? [];

  if (
    upstream.body &&
    codings.length &&
    codings.every((coding) => ['gzip', 'x-gzip', 'deflate', 'br', 'zstd'].includes(coding))
  ) {
    headers.delete('content-encoding');
  }

  headers.delete('content-length');

  return new Response([204, 205, 304].includes(upstream.status) ? null : upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

export function proxy(): Middleware<'proxies'> {
  return async (context, next) => {
    if (!context.upstream) {
      throw new Error();
    }

    context.response = create(context.upstream);
    await next();
  };
}
