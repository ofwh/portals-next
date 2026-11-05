import 'server-only';
import { fetch } from 'undici';
import repository from '@/lib/repositories/proxies';
import { validPathname } from '@/lib/shared/validation';
import type {
  ConfigMap,
  ConsumerMiddleware,
  ConsumerRequest,
  Middleware,
  Next,
  OutboundRequest,
  ProxyRouteConsumer,
  RouteContext,
} from '@/lib/types/route';
import {
  applyCors,
  requestAuthorize,
  requestExpired,
  requestHeaders,
  requestOutbound,
  requestParameters,
  requestProxy,
  responseCors,
  responseProxy,
} from '../middleware';

class ProxyConsumer implements ProxyRouteConsumer {
  readonly mode = 'proxies' as const;
  private middleware: ConsumerMiddleware<'proxies'> = { request: [], response: [] };
  private configured = false;

  use(options: ConsumerMiddleware<'proxies'>): this {
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
    let config: ConfigMap['proxies'] | undefined;

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

  async request(outbound: OutboundRequest): Promise<Response> {
    try {
      const upstream = await fetch(outbound.url, {
        method: outbound.method,
        headers: [...outbound.headers],
        body: outbound.body,
        dispatcher: outbound.dispatcher,
        redirect: 'follow',
        signal: AbortSignal.any([outbound.signal, AbortSignal.timeout(30000)]),
      });
      const headers = new Headers();

      upstream.headers.forEach((value, name) => {
        if (name !== 'set-cookie') {
          headers.append(name, value);
        }
      });
      for (const cookie of upstream.headers.getSetCookie()) {
        headers.append('set-cookie', cookie);
      }

      return new Response(upstream.body as ReadableStream<Uint8Array> | null, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers,
      });
    } catch (error) {
      const timeout = error instanceof Error && error.name === 'TimeoutError';

      throw Object.assign(new Error(), { status: timeout ? 504 : 502 });
    }
  }

  private async execute(context: RouteContext<'proxies'>, next: Next): Promise<void> {
    if (!context.outbound) {
      throw new Error();
    }

    context.upstream = await this.request(context.outbound);
    await next();
  }

  private async run(context: RouteContext<'proxies'>): Promise<Response> {
    const chain: readonly Middleware<'proxies'>[] = [
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

export const proxies: ProxyRouteConsumer = new ProxyConsumer().use({
  request: [
    requestParameters(),
    requestAuthorize(),
    requestExpired(),
    requestOutbound(),
    requestHeaders(),
    requestProxy(),
  ],
  response: [responseProxy(), responseCors()],
});

export default proxies;
