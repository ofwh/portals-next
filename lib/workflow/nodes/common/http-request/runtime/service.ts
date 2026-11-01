import 'server-only';
import { appError } from '@/lib/api';
import type { ExecutionContext } from '../../../types';
import type { HttpRequestConfig, HttpRequestOutput } from '../model/types';

export async function request(config: HttpRequestConfig, context: ExecutionContext): Promise<HttpRequestOutput> {
  context.signal.throwIfAborted();
  const headers = new Headers();

  for (const header of config.headers) {
    headers.append(header.name, header.value);
  }
  let response: Response;

  try {
    response = await fetch(config.url, {
      method: config.method,
      headers,
      ...(config.method === 'POST' ? { body: config.body } : {}),
      signal: context.signal,
      cache: 'no-store',
    });
  } catch {
    context.signal.throwIfAborted();

    throw appError('workflow.HTTP_REQUEST_FAILED');
  }
  try {
    const body: unknown = config.outputFormat === 'JSON' ? await response.json() : await response.text();

    context.signal.throwIfAborted();

    return { header: Array.from(response.headers, ([name, value]) => ({ name, value })), body };
  } catch (error) {
    context.signal.throwIfAborted();

    throw appError(error instanceof SyntaxError ? 'workflow.HTTP_INVALID_JSON' : 'workflow.HTTP_REQUEST_FAILED');
  }
}

const service = { request };

export default service;
