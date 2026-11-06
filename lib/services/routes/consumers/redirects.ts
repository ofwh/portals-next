import 'server-only';
import repository from '@/lib/repositories/redirects';
import { validPathname } from '@/lib/shared/validation';
import type {
  ConfigMap,
  ConsumerMiddleware,
  ConsumerRequest,
  Middleware,
  Next,
  RouteConsumer,
  RouteContext,
} from '@/lib/types/route';
import { requestAuthorize, requestExpired, requestParameters, responseRedirect } from '../middleware';

class RedirectConsumer implements RouteConsumer<'redirects'> {
  readonly mode = 'redirects' as const;
  private middleware: ConsumerMiddleware<'redirects'> = { request: [], response: [] };
  private configured = false;

  use(options: ConsumerMiddleware<'redirects'>): this {
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
    let config: ConfigMap['redirects'] | undefined;

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

      return response;
    }
  }

  private async execute(_context: RouteContext<'redirects'>, next: Next): Promise<void> {
    await next();
  }

  private async run(context: RouteContext<'redirects'>): Promise<Response> {
    const chain: readonly Middleware<'redirects'>[] = [
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

export const redirects: RouteConsumer<'redirects'> = new RedirectConsumer().use({
  request: [requestParameters(), requestAuthorize(), requestExpired()],
  response: [responseRedirect()],
});

export default redirects;
