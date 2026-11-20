import 'server-only';
import { appError, businessCode, errorMessage } from '@/lib/api';
import logger from '@/lib/api/logger';
import { getRequestId } from '@/lib/api/request-context';
import { request as sendRequest } from '@/lib/shared/http';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import type { HttpRequestConfig, HttpRequestOutput } from '../model/types';

export async function request(config: HttpRequestConfig, context: ExecutionContext): Promise<HttpRequestOutput> {
  context.signal.throwIfAborted();

  try {
    const response = await sendRequest(config.url, {
      requestId: getRequestId(),
      method: config.method,
      headers: config.headers,
      ...(config.method === 'POST' ? { body: config.body } : {}),
      signal: context.signal,
      cache: 'no-store',
    });

    const body = await response.text();

    context.signal.throwIfAborted();

    return body;
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

const service = { request };

export default service;
