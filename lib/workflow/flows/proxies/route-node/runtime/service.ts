import 'server-only';
import { appError, businessCode, errorMessage } from '@/lib/api';
import logger from '@/lib/api/logger';
import { getRequestId, withRequestId } from '@/lib/api/request-context';
import caches from '@/lib/services/routes/caches';
import originals from '@/lib/services/routes/originals';
import proxies from '@/lib/services/routes/proxies';
import redirects from '@/lib/services/routes/redirects';
import { request as sendRequest } from '@/lib/shared/http';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import type { RouteConfig, RouteOutput } from '../model/types';

const services = { proxies, redirects, caches, originals };

export async function request(config: RouteConfig, context: ExecutionContext): Promise<RouteOutput> {
  context.signal.throwIfAborted();

  try {
    const url = new URL(`/${config.mode}${config.pathname}`, 'http://localhost');

    if (config.token) {
      url.searchParams.set('token', config.token);
    }

    const req = new Request(url, {
      method: config.method,
      headers: withRequestId(
        new Headers(config.method === 'POST' ? { 'content-type': 'text/plain; charset=utf-8' } : {}),
      ),
      ...(config.method === 'POST' ? { body: config.body } : {}),
      signal: context.signal,
    });
    let response = await services[config.mode].handle({
      req,
      pathname: config.pathname,
      params: { type: config.mode, slug: config.pathname.slice(1).split('/') },
    });
    const location = response.headers.get('location');

    if ([301, 302, 303, 307, 308].includes(response.status) && location) {
      const method = [307, 308].includes(response.status) ? config.method : 'GET';

      await response.body?.cancel();
      response = await sendRequest(location, {
        method,
        ...(method === 'POST' ? { body: config.body } : {}),
        requestId: getRequestId(),
        signal: context.signal,
        cache: 'no-store',
      });
    }

    const body = await response.text();

    context.signal.throwIfAborted();

    return body;
  } catch (error) {
    context.signal.throwIfAborted();

    const failure = appError('workflow.ROUTE_REQUEST_FAILED');

    logger.error(errorMessage(failure), {
      code: businessCode(failure.code),
      runId: context.runId,
      nodeId: context.nodeId,
      data: { mode: config.mode, pathname: config.pathname, method: config.method },
      error: error instanceof Error ? error.message : error,
    });

    throw failure;
  }
}

const service = { request };

export default service;
