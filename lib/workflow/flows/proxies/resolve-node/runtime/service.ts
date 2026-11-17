import 'server-only';
import { appError } from '@/lib/api';
import { parseSubscriptionNodes, PROXY_PROTOCOLS } from '@/lib/subscription/node';
import type { ProxyNode } from '@/lib/subscription/types';
import type { ExecutionContext } from '@/lib/workflow/node/types';

const protocols = new Set(PROXY_PROTOCOLS);

export function parse(inputs: readonly string[], context: ExecutionContext): ProxyNode[] {
  const nodes: ProxyNode[] = [];

  for (const input of inputs) {
    context.signal.throwIfAborted();
    const result = parseSubscriptionNodes(input, protocols);

    if (!result.ok) {
      throw appError('common.INVALID_PARAMS');
    }

    nodes.push(...result.nodes);
  }

  return nodes;
}

const providerService = { parse };

export default providerService;
