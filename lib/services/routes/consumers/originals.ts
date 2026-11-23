import 'server-only';
import repository from '@/lib/repositories/originals';
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
import { requestAuthorize, requestExpired, requestParameters, responseCharset, responseOriginal } from '../middleware';
import { failure, withErrorCode } from '../response';

class OriginalConsumer implements RouteConsumer<'originals'> {
  readonly mode = 'originals' as const;
  private middleware: ConsumerMiddleware<'originals'> = { request: [], response: [] };
  private configured = false;

  use(options: ConsumerMiddleware<'originals'>): this {
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
    let config: ConfigMap['originals'] | undefined;

    try {
      if (!['GET', 'POST'].includes(input.req.method)) {
        return withErrorCode(
          new Response(null, { status: 405, headers: { allow: 'GET, POST' } }),
          'routes.METHOD_NOT_ALLOWED',
        );
      }

      if (!validPathname(input.pathname)) {
        return withErrorCode(new Response(null, { status: 404 }), 'routes.INVALID_PATHNAME');
      }

      config = repository.findByPath(input.pathname);
      if (!config) {
        return withErrorCode(new Response(null, { status: 404 }), 'routes.ORIGINAL_NOT_FOUND');
      }

      if (!config.status) {
        return withErrorCode(new Response(null, { status: 404 }), 'routes.ROUTE_DISABLED');
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
      const response = failure(error);

      return response;
    }
  }

  private async execute(_context: RouteContext<'originals'>, next: Next): Promise<void> {
    await next();
  }

  private async run(context: RouteContext<'originals'>): Promise<Response> {
    const chain: readonly Middleware<'originals'>[] = [
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

export const originals: RouteConsumer<'originals'> = new OriginalConsumer().use({
  request: [requestParameters(), requestAuthorize(), requestExpired()],
  response: [responseOriginal(), responseCharset('originals')],
});

export default originals;
