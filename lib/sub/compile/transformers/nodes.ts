import { logger } from 'better-auth';
import type { ProxyNode } from '../../shared/types';
import { providers } from '../providers';
import type { CompiledNode, SubscriptionType } from '../types';

export function compileNodes(
  nodes?: ProxyNode[],
  target: SubscriptionType = 'mixed',
  options?: Record<string, unknown>,
): CompiledNode[] {
  if (!Object.hasOwn(providers, target)) {
    logger.info(`Unsupported subscription target "${target}"`);

    return [];
  }

  const provider = providers[target];

  return provider.compileNodes(nodes, options);
}
