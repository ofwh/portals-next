import { notFound } from 'next/navigation';
import { ROUTE_TYPE } from '@/lib/constants';
import shortcuts from '@/lib/services/shortcuts';
import type { RouteHandlerContext } from '@/lib/types/route';

const services = {
  [ROUTE_TYPE.PROXY]: () => import('@/lib/services/routes/proxies'),
  [ROUTE_TYPE.REDIRECT]: () => import('@/lib/services/routes/redirects'),
  [ROUTE_TYPE.CACHE]: () => import('@/lib/services/routes/caches'),
  [ROUTE_TYPE.ORIGINAL]: () => import('@/lib/services/routes/originals'),
};

async function handle(req: Request, context: RouteHandlerContext): Promise<Response> {
  const params = await context.params;
  const match = shortcuts.resolve('/' + [params.type, ...params.slug].join('/'));

  if (!match) {
    notFound();
  }

  const { default: service } = await services[match.type]();

  return service.handle({ req, params, pathname: match.pathname });
}

export async function GET(req: Request, context: RouteHandlerContext): Promise<Response> {
  return handle(req, context);
}

export async function POST(req: Request, context: RouteHandlerContext): Promise<Response> {
  return handle(req, context);
}
