import { createHash } from 'node:crypto';
import 'server-only';
import repository from '@/lib/repositories/caches';
import redis from '@/lib/services/redis';
import { validPathname } from '@/lib/shared/validation';
import type {
  CacheKey,
  CacheRecord,
  CacheRouteConsumer,
  CacheSnapshot,
  ConfigMap,
  ConsumerMiddleware,
  ConsumerRequest,
  Middleware,
  Next,
  RouteContext,
} from '@/lib/types/route';
import { proxies as proxyConsumer } from './proxies';
import {
  applyCors,
  requestAuthorize,
  requestExpired,
  requestHeaders,
  requestOutbound,
  requestParameters,
  requestProxy,
  responseCache,
  responseCors,
} from '../middleware';
import { create } from '../middleware/response.proxy';

class CacheConsumer implements CacheRouteConsumer {
  readonly mode = 'caches' as const;
  private middleware: ConsumerMiddleware<'caches'> = { request: [], response: [] };
  private configured = false;
  private readonly refreshing = new Map<string, Promise<CacheSnapshot>>();

  use(options: ConsumerMiddleware<'caches'>): this {
    if (this.configured) {
      throw new Error('Consumer already configured');
    }

    this.middleware = Object.freeze({
      request: Object.freeze([...options.request]),
      response: Object.freeze([...options.response]),
    });
    this.configured = true;

    return this;
  }

  async handle(input: ConsumerRequest): Promise<Response> {
    let config: ConfigMap['caches'] | undefined;

    try {
      if (!['GET', 'POST'].includes(input.req.method)) {
        return new Response(null, { status: 405, headers: { allow: 'GET, POST' } });
      }

      if (!validPathname(input.pathname)) {
        return new Response(null, { status: 404 });
      }

      config = repository.findByPath(input.pathname);
      if (!config || !config.status) {
        return new Response(null, { status: 404 });
      }

      if (!this.configured) {
        throw new Error();
      }

      return await this.run({
        ...input,
        config,
        now: new Date(),
        parameters: null,
        outbound: null,
        upstream: null,
        snapshot: null,
        response: null,
      });
    } catch (error) {
      const status =
        error &&
        typeof error === 'object' &&
        'status' in error &&
        typeof error.status === 'number' &&
        [400, 401, 410, 413, 502, 504].includes(error.status)
          ? error.status
          : 500;
      const response = new Response(null, { status });

      return config ? applyCors(input.req, response, config.cors) : response;
    }
  }

  async invalidate(config: ConfigMap['caches']): Promise<void> {
    const key = this.createKey(config);

    await redis.remove(`routes:caches:${key.routeId}:${key.revision}`).catch(() => undefined);
  }

  private createKey(config: ConfigMap['caches']): CacheKey {
    const revision = createHash('sha256')
      .update(
        JSON.stringify({
          id: config.id,
          updatedAt: config.updatedAt,
          url: config.url,
          method: config.method,
          format: config.format,
          body: config.body,
          headers: config.headers,
          proxy: config.proxy,
          ttl: config.ttl,
          cors: config.cors,
        }),
      )
      .digest('hex');

    return { routeId: config.id, revision };
  }

  private seconds(ttl: number): number | undefined {
    const seconds = Math.ceil(ttl * 86400);

    if (!Number.isFinite(ttl) || ttl < 0 || !Number.isSafeInteger(seconds)) {
      throw new Error();
    }

    return ttl === 0 ? undefined : seconds;
  }

  private async snapshot(response: Response): Promise<CacheSnapshot> {
    const normalized = create(response);
    let body: Uint8Array;

    try {
      body = new Uint8Array(await normalized.arrayBuffer());
    } catch (error) {
      throw Object.assign(new Error(), { status: error instanceof Error && error.name === 'TimeoutError' ? 504 : 502 });
    }

    return {
      status: normalized.status,
      statusText: normalized.statusText,
      headers: [...normalized.headers],
      body,
      cachedAt: new Date(),
    };
  }

  private encode(snapshot: CacheSnapshot): Uint8Array {
    const { body, cachedAt, ...metadata } = snapshot;
    const record: CacheRecord = {
      ...metadata,
      bodyBase64: Buffer.from(body).toString('base64'),
      cachedAt: cachedAt.toISOString(),
    };

    return Buffer.from(JSON.stringify(record));
  }

  private decode(value: Uint8Array): CacheSnapshot | null {
    try {
      const record: unknown = JSON.parse(Buffer.from(value).toString('utf8'));

      if (
        !record ||
        typeof record !== 'object' ||
        !('status' in record) ||
        typeof record.status !== 'number' ||
        !Number.isInteger(record.status) ||
        record.status < 200 ||
        record.status >= 300 ||
        !('statusText' in record) ||
        typeof record.statusText !== 'string' ||
        /[\r\n]/.test(record.statusText) ||
        !('headers' in record) ||
        !Array.isArray(record.headers) ||
        !('bodyBase64' in record) ||
        typeof record.bodyBase64 !== 'string' ||
        !('cachedAt' in record) ||
        typeof record.cachedAt !== 'string' ||
        !Number.isFinite(Date.parse(record.cachedAt))
      ) {
        return null;
      }

      const headers: [string, string][] = [];

      for (const item of record.headers) {
        if (!Array.isArray(item) || item.length !== 2 || typeof item[0] !== 'string' || typeof item[1] !== 'string') {
          return null;
        }

        headers.push([item[0], item[1]]);
      }
      new Headers(headers);

      const body = Buffer.from(record.bodyBase64, 'base64');

      if (body.toString('base64') !== record.bodyBase64) {
        return null;
      }

      return {
        status: record.status,
        statusText: record.statusText,
        headers,
        body,
        cachedAt: new Date(record.cachedAt),
      };
    } catch {
      return null;
    }
  }

  private async refresh(context: RouteContext<'caches'>, key: CacheKey): Promise<CacheSnapshot> {
    if (!context.outbound) {
      throw new Error();
    }

    const response = await proxyConsumer.request(context.outbound);
    const headers = response.headers;
    const cacheable =
      response.ok &&
      response.status !== 206 &&
      !headers.has('set-cookie') &&
      !/(?:^|,)\s*(?:private|no-store)(?:\s|=|,|$)/i.test(headers.get('cache-control') ?? '') &&
      !(headers.get('vary') ?? '').split(',').some((name) => name.trim() === '*');
    const snapshot = await this.snapshot(response);
    const current = repository.findById(context.config.id);

    if (cacheable && current && this.createKey(current).revision === key.revision) {
      const redisKey = `routes:caches:${key.routeId}:${key.revision}`;
      const saved = await redis
        .set(redisKey, this.encode(snapshot), { ttlSeconds: this.seconds(context.config.ttl) })
        .then(
          () => true,
          () => false,
        );

      if (saved) {
        repository.markCached(current.id, current.updatedAt, snapshot.cachedAt);
        const latest = repository.findById(current.id);

        if (!latest || this.createKey(latest).revision !== key.revision) {
          await redis.remove(redisKey).catch(() => undefined);
        }
      }
    }

    return snapshot;
  }

  private async execute(context: RouteContext<'caches'>, next: Next): Promise<void> {
    if (!process.env.REDIS_URL) {
      throw new Error();
    }

    this.seconds(context.config.ttl);

    const key = this.createKey(context.config);
    const redisKey = `routes:caches:${key.routeId}:${key.revision}`;
    const value = await redis.get(redisKey).catch(() => null);

    context.snapshot = value ? this.decode(value) : null;
    if (!context.snapshot) {
      let pending = this.refreshing.get(redisKey);

      if (!pending) {
        pending = this.refresh(context, key);
        this.refreshing.set(redisKey, pending);
      }

      try {
        context.snapshot = await pending;
      } finally {
        if (this.refreshing.get(redisKey) === pending) {
          this.refreshing.delete(redisKey);
        }
      }
    }

    await next();
  }

  private async run(context: RouteContext<'caches'>): Promise<Response> {
    const chain: readonly Middleware<'caches'>[] = [
      ...this.middleware.request,
      this.execute.bind(this),
      ...this.middleware.response,
    ];
    let position = -1;

    const dispatch = async (index: number): Promise<void> => {
      if (index <= position) {
        throw new Error('next called more than once');
      }

      position = index;
      await chain[index]?.(context, () => dispatch(index + 1));
    };

    await dispatch(0);
    if (!context.response) {
      throw new Error();
    }

    return context.response;
  }
}

export const caches: CacheRouteConsumer = new CacheConsumer().use({
  request: [
    requestParameters(),
    requestAuthorize(),
    requestExpired(),
    requestOutbound(),
    requestHeaders(),
    requestProxy(),
  ],
  response: [responseCache(), responseCors()],
});

export default caches;
