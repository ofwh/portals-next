import { notFound } from 'next/navigation';
import { after } from 'next/server';
import { AppError, businessCode } from '@/lib/api';
import logger from '@/lib/api/logger';
import { getRequestId, withRequestContext } from '@/lib/api/request-context';
import { ROUTE_TYPE } from '@/lib/constants';
import { getErrorCode } from '@/lib/services/routes/response';
import shortcuts from '@/lib/services/shortcuts';
import type { RouteHandlerContext } from '@/lib/types/route';

const services = {
  [ROUTE_TYPE.PROXY]: () => import('@/lib/services/routes/proxies'),
  [ROUTE_TYPE.REDIRECT]: () => import('@/lib/services/routes/redirects'),
  [ROUTE_TYPE.CACHE]: () => import('@/lib/services/routes/caches'),
  [ROUTE_TYPE.ORIGINAL]: () => import('@/lib/services/routes/originals'),
  [ROUTE_TYPE.SUBSCRIPTION]: () => import('@/lib/services/subscriptions'),
};

async function handle(req: Request, context: RouteHandlerContext): Promise<Response> {
  const visitAt = new Date();
  const startedAt = performance.now();
  const url = req.url;
  const headers = new Headers(req.headers);

  return withRequestContext(req, async () => {
    const params = await context.params;
    const match = shortcuts.resolve('/' + [params.type, ...params.slug].join('/'));

    if (!match) {
      notFound();
    }

    const requestId = getRequestId();
    let statusCode: number | null = null;
    let errorCode: number | null = null;

    try {
      const { default: service } = await services[match.type]();

      const response = await service.handle({ req, params, pathname: match.pathname });

      statusCode = response.status;
      errorCode = getErrorCode(response);

      return response;
    } catch (error) {
      errorCode = error instanceof AppError ? businessCode(error.code) : null;

      throw error;
    } finally {
      const duration = Math.floor(performance.now() - startedAt);

      after(async () => {
        try {
          const { default: analytics } = await import('@/lib/services/analytics');
          const { resolveIp } = await import('@/lib/services/analytics/client-info');

          analytics.record({
            requestId,
            visitAt,
            routeType: match.type,
            url,
            pathname: match.pathname,
            ua: headers.get('user-agent'),
            ip: resolveIp(headers),
            duration,
            statusCode,
            errorCode,
          });
        } catch (error) {
          logger.error('Failed to record route analytics', {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });
    }
  });
}

export async function GET(req: Request, context: RouteHandlerContext): Promise<Response> {
  return handle(req, context);
}

export async function POST(req: Request, context: RouteHandlerContext): Promise<Response> {
  return handle(req, context);
}
