import type { ProxyNode } from '@/lib/subscription/types/proxy-node';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import providerService from './service';
import type { ProxyListConfig } from '../model/types';

export async function execute(
  input: readonly string[],
  _config: ProxyListConfig,
  context: ExecutionContext,
): Promise<ProxyNode[]> {
  return providerService.parse(input, context);
}
