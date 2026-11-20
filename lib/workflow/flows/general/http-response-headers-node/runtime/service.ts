import 'server-only';
import { appError, businessCode, errorMessage } from '@/lib/api';
import logger from '@/lib/api/logger';
import { getRequestId } from '@/lib/api/request-context';
import { request } from '@/lib/shared/http';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import type { HttpResponseHeadersConfig, HttpResponseHeadersOutput } from '../model/types';

export async function headers(
  config: HttpResponseHeadersConfig,
  context: ExecutionContext,
): Promise<HttpResponseHeadersOutput> {
  context.signal.throwIfAborted();

  try {
    const response = await request(config.url, {
      requestId: getRequestId(),
      method: config.method,
      headers: config.headers,
      ...(config.method === 'POST' ? { body: config.body } : {}),
      signal: context.signal,
      cache: 'no-store',
    });

    const headers = Object.fromEntries(response.headers);

    await response.body?.cancel();
    context.signal.throwIfAborted();

    return headers;
  } catch (error) {
    context.signal.throwIfAborted();

    const failure = appError('workflow.HTTP_REQUEST_FAILED');

    logger.error(errorMessage(failure), {
      code: businessCode(failure.code),
      runId: context.runId,
      nodeId: context.nodeId,
      data: { method: config.method, url: config.url },
      error: error instanceof Error ? error.message : error,
    });

    throw failure;
  }
}

const service = { headers };

export default service;
