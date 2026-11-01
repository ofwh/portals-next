import 'server-only';
import { requestService } from './services';
import type { HttpRequestConfig, HttpRequestOutput } from './types';
import type { ExecutionContext } from '../../types';

export async function execute(
  _input: null,
  config: HttpRequestConfig,
  context: ExecutionContext,
): Promise<HttpRequestOutput> {
  return requestService.request(config, context);
}
