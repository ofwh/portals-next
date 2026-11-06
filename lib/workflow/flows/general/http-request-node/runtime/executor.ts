import 'server-only';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import { default as requestService } from './service';
import type { HttpRequestConfig, HttpRequestOutput } from '../model/types';

export async function execute(
  _input: null,
  config: HttpRequestConfig,
  context: ExecutionContext,
): Promise<HttpRequestOutput> {
  return requestService.request(config, context);
}
