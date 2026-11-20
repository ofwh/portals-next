import 'server-only';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import service from './service';
import type { RouteConfig, RouteOutput } from '../model/types';

export async function execute(_input: null, config: RouteConfig, context: ExecutionContext): Promise<RouteOutput> {
  return service.request(config, context);
}
