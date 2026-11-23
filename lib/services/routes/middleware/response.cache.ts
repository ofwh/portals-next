import { isUtf8 } from 'node:buffer';
import type { ConfigMap, Middleware } from '@/lib/types/route';
import { setUtf8Charset } from './response.charset';
import { applyCorsHeaders } from './response.cors';

const CACHE_RESPONSE_HEADERS = new Set([
  'access-control-allow-credentials',
  'access-control-allow-headers',
  'access-control-allow-methods',
  'access-control-allow-origin',
  'access-control-expose-headers',
  'access-control-max-age',
  'allow',
  'cache-control',
  'content-disposition',
  'content-encoding',
  'content-language',
  'content-range',
  'content-security-policy',
  'content-type',
  'cross-origin-embedder-policy',
  'cross-origin-opener-policy',
  'cross-origin-resource-policy',
  'etag',
  'expires',
  'last-modified',
  'location',
  'permissions-policy',
  'referrer-policy',
  'retry-after',
  'vary',
  'www-authenticate',
  'x-content-type-options',
  'x-frame-options',
]);

export function cleanupMeta(input: Headers, body: Uint8Array | null, cors: ConfigMap['caches']['cors']): Headers {
  const headers = new Headers(input);

  for (const name of [...headers.keys()]) {
    if (!CACHE_RESPONSE_HEADERS.has(name)) {
      headers.delete(name);
    }
  }

  if (body && !headers.has('content-encoding') && isUtf8(body)) {
    setUtf8Charset(headers);
  }

  applyCorsHeaders(headers, cors);

  return headers;
}

export function cache(): Middleware<'caches'> {
  return async (context, next) => {
    const snapshot = context.snapshot;

    if (!snapshot) {
      throw new Error();
    }

    context.response = new Response([204, 205, 304].includes(snapshot.status) ? null : new Uint8Array(snapshot.body), {
      status: snapshot.status,
      statusText: snapshot.statusText,
      headers: snapshot.headers,
    });
    await next();
  };
}
