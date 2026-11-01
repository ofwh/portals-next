import 'server-only';
import { default as requestService } from './service';
import type { ExecutionContext } from '../../../types';
import type { HttpRequestConfig, HttpRequestOutput } from '../model/types';

export async function execute(
  _input: null,
  config: HttpRequestConfig,
  context: ExecutionContext,
): Promise<HttpRequestOutput> {
  return requestService.request(config, context);
}
