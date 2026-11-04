import 'server-only';
import { appError } from '@/lib/api';
import { request as sendRequest } from '@/lib/shared/http';
import type { ExecutionContext } from '@/lib/workflow/nodes/types';
import type { HttpRequestConfig, HttpRequestOutput } from '../model/types';

export async function request(config: HttpRequestConfig, context: ExecutionContext): Promise<HttpRequestOutput> {
  context.signal.throwIfAborted();

  try {
    const response = await sendRequest(config.url, {
      method: config.method,
      headers: config.headers,
      ...(config.method === 'POST' ? { body: config.body } : {}),
      signal: context.signal,
      cache: 'no-store',
    });

    const body = await response.text();

    context.signal.throwIfAborted();

    return body;
  } catch {
    context.signal.throwIfAborted();

    throw appError('workflow.HTTP_REQUEST_FAILED');
  }
}

const service = { request };

export default service;
