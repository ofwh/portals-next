import type { ProxyGroup } from '@/lib/subscription/types/policy';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import service from './service';
import type { PolicyResolveConfig } from '../model/types';

export async function execute(
  input: string,
  config: PolicyResolveConfig,
  context: ExecutionContext,
): Promise<ProxyGroup[]> {
  return service.parse(input, config, context);
}
