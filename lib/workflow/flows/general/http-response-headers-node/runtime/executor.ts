import 'server-only';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import { default as requestService } from './service';
import type { HttpResponseHeadersConfig, HttpResponseHeadersOutput } from '../model/types';

export async function execute(
  _input: null,
  config: HttpResponseHeadersConfig,
  context: ExecutionContext,
): Promise<HttpResponseHeadersOutput> {
  return requestService.headers(config, context);
}
