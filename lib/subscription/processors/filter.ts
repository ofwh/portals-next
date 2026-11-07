import 'server-only';
import logger from '@/lib/api/logger';
import type { ProxyNode, ProxyProtocol } from '../types/proxy-node';

export function filter(
  nodes: readonly ProxyNode[],
  protocols: ReadonlySet<ProxyProtocol>,
  patterns: readonly RegExp[],
  exclude: boolean,
  signal: AbortSignal,
): ProxyNode[] {
  signal.throwIfAborted();

  return nodes.filter((node, index) => {
    signal.throwIfAborted();
    if (!protocols.size && !patterns.length) {
      return true;
    }

    const matches =
      (!protocols.size || protocols.has(node.protocol)) &&
      (!patterns.length ||
        patterns.some((regex) => {
          regex.lastIndex = 0;

          return regex.test(node.name);
        }));
    const keep = exclude ? !matches : matches;

    if (!keep) {
      logger.info('Proxy node filtered', { index, name: node.name, protocol: node.protocol, exclude });
    }

    return keep;
  });
}

const service = { filter };

export default service;
