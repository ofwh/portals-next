import 'server-only';
import { appError } from '@/lib/api';
import type { ExecutionContext } from '@/lib/workflow/nodes/types';
import { request } from '../../../utils/http';
import type { HttpResponseHeadersConfig, HttpResponseHeadersOutput } from '../model/types';

export async function headers(
  config: HttpResponseHeadersConfig,
  context: ExecutionContext,
): Promise<HttpResponseHeadersOutput> {
  context.signal.throwIfAborted();

  try {
    const response = await request(config.url, {
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
  } catch {
    context.signal.throwIfAborted();

    throw appError('workflow.HTTP_REQUEST_FAILED');
  }
}

const service = { headers };

export default service;
