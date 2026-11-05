import type { IncomingMessage } from 'node:http';
import { Readable } from 'node:stream';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';
import Busboy from 'busboy';
import coBody from 'co-body';
import qs from 'qs';
import getRawBody from 'raw-body';
import type { RouteMode } from '@/lib/constants/routes';
import type {
  ConfigMap,
  ForwardMode,
  JsonValue,
  Middleware,
  Parameters,
  ParsedBody,
  QueryData,
  RouteParams,
} from '@/lib/types/route';

const BODY_LIMIT = 8 * 1024 * 1024;
const QUERY_OPTIONS = {
  depth: 8,
  parameterLimit: 1000,
  arrayLimit: 100,
  allowPrototypes: false,
  strictDepth: true,
  throwOnLimitExceeded: true,
};

function source(body: Uint8Array | string): IncomingMessage {
  return Object.assign(Readable.from([body]), { headers: {} }) as IncomingMessage;
}

function isJson(value: unknown): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return true;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.every(isJson);
  }

  return typeof value === 'object' && Object.values(value).every(isJson);
}

function parseQuery(search: string): QueryData {
  return qs.parse(search, QUERY_OPTIONS) as QueryData;
}

async function multipart(body: Buffer, contentType: string): Promise<Record<string, (string | File)[]>> {
  const parser = Busboy({
    headers: { 'content-type': contentType },
    limits: { fileSize: BODY_LIMIT, fieldSize: BODY_LIMIT, files: 20, fields: 1000, parts: 1020 },
  });
  const result: Record<string, (string | File)[]> = Object.create(null);
  const files: Promise<void>[] = [];

  await new Promise<void>((resolve, reject) => {
    const fail = () => reject(Object.assign(new Error(), { status: 413 }));

    parser.on('field', (name, value, info) => {
      if (info.valueTruncated || info.nameTruncated) {
        fail();

        return;
      }

      (result[name] ??= []).push(value);
    });
    parser.on('file', (name, stream, info) => {
      files.push(
        (async () => {
          const bytes = await getRawBody(stream, { limit: BODY_LIMIT });

          if (stream.truncated) {
            throw Object.assign(new Error(), { status: 413 });
          }

          (result[name] ??= []).push(new File([new Uint8Array(bytes)], info.filename ?? '', { type: info.mimeType }));
        })().catch(reject),
      );
    });
    parser.on('filesLimit', fail);
    parser.on('fieldsLimit', fail);
    parser.on('partsLimit', fail);
    parser.on('error', reject);
    parser.on('close', resolve);
    parser.end(body);
  });
  await Promise.all(files);

  return result;
}

async function parseBody(req: Request): Promise<ParsedBody> {
  if (!req.body || req.method === 'GET') {
    return null;
  }

  const stream = Readable.fromWeb(req.body as NodeReadableStream<Uint8Array>);
  const body = await getRawBody(stream, { limit: BODY_LIMIT }).finally(() => stream.destroy());

  if (body.length === 0) {
    return null;
  }

  const contentType = req.headers.get('content-type') ?? '';
  const type = contentType.split(';')[0].trim().toLowerCase();

  if (type === 'multipart/form-data') {
    return multipart(body, contentType);
  }

  if (type === 'application/json' || type.endsWith('+json')) {
    const value: unknown = await coBody.json(source(body), { limit: BODY_LIMIT, strict: false });

    if (!isJson(value)) {
      throw new Error();
    }

    return value;
  }

  if (type === 'application/x-www-form-urlencoded') {
    return (await coBody.form(source(body), { limit: BODY_LIMIT, queryString: QUERY_OPTIONS })) as QueryData;
  }

  if (type.startsWith('text/')) {
    return (await coBody.text(source(body), { limit: BODY_LIMIT })) as string;
  }

  return new Uint8Array(body);
}

async function parse(req: Request, params: RouteParams): Promise<Parameters> {
  return { params, query: parseQuery(new URL(req.url).search.slice(1)), body: await parseBody(req) };
}

async function parseConfiguredBody(config: ConfigMap['proxies'] | ConfigMap['caches']): Promise<string | null> {
  if (config.method === 'GET' || config.body === null) {
    return null;
  }

  if (config.format === 'JSON') {
    const value: unknown = await coBody.json(source(config.body), { strict: false, limit: BODY_LIMIT });

    if (!isJson(value)) {
      throw new Error();
    }

    return JSON.stringify(value);
  }

  if (config.format === 'FORM') {
    return qs.stringify(parseQuery(config.body));
  }

  return (await coBody.text(source(config.body), { limit: BODY_LIMIT })) as string;
}

export function parameters<K extends RouteMode>(): Middleware<K> {
  return async (context, next) => {
    try {
      context.parameters = await parse(context.req.clone(), context.params);
    } catch (error) {
      const status = error && typeof error === 'object' && 'status' in error && error.status === 413 ? 413 : 400;

      throw Object.assign(new Error(), { status });
    }
    await next();
  };
}

export function outbound<K extends ForwardMode>(): Middleware<K> {
  return async (context, next) => {
    const url = new URL(context.config.url);

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error();
    }

    context.outbound = {
      url,
      method: context.config.method,
      body: await parseConfiguredBody(context.config),
      headers: new Headers(),
      dispatcher: undefined,
      signal: context.req.signal,
    };
    await next();
  };
}
