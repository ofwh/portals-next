import 'server-only';
import { appError } from '@/lib/api';
import { parseProviders, proxyProtocols } from '@/lib/subscription/providers';
import type { ProxyNode } from '@/lib/subscription/types/proxy-node';
import type { ExecutionContext } from '@/lib/workflow/node/types';

const protocols = new Set(proxyProtocols);

export function parse(inputs: readonly string[], context: ExecutionContext): ProxyNode[] {
  const nodes: ProxyNode[] = [];

  for (const input of inputs) {
    context.signal.throwIfAborted();
    const result = parseProviders(input, protocols);

    if (!result.ok) {
      throw appError('common.INVALID_PARAMS');
    }

    nodes.push(...result.nodes);
  }

  return nodes;
}

const providerService = { parse };

export default providerService;
