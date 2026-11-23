import { MIMEType } from 'node:util';
import type { Middleware } from '@/lib/types/route';

export function setUtf8Charset(headers: Headers, includeProxyTypes = false): void {
  const contentType = headers.get('content-type');

  if (!contentType) {
    return;
  }

  let mime: MIMEType;

  try {
    mime = new MIMEType(contentType);
  } catch {
    return;
  }

  if (
    !mime.params.has('charset') &&
    (mime.type === 'text' ||
      mime.subtype.endsWith('+xml') ||
      /^application\/(?:xml|javascript|x-javascript)$/.test(mime.essence) ||
      (includeProxyTypes &&
        (mime.subtype.endsWith('+json') ||
          mime.subtype.endsWith('+yaml') ||
          /^application\/(?:json|yaml|x-yaml|toml|sql)$/.test(mime.essence))))
  ) {
    mime.params.set('charset', 'utf-8');
    headers.set('content-type', mime.toString());
  }
}

export function charset<K extends 'originals' | 'proxies'>(mode: K): Middleware<K> {
  return async (context, next) => {
    if (context.response?.body) {
      setUtf8Charset(context.response.headers, mode === 'proxies');
    }

    await next();
  };
}
