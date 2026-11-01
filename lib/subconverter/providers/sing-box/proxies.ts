import type { ProxyNode } from '@/lib/types/subscriptions/nodes';
import { formatSingBox } from '../../format';
import { normalizeSingBox } from '../../normalize';
import type { SingBoxConfig } from '../../types/sing-box';

export function parse(config: SingBoxConfig): ProxyNode[] {
  return (config.outbounds ?? [])
    .filter((node) => !['direct', 'block', 'dns', 'selector', 'urltest'].includes(node.type))
    .map(normalizeSingBox);
}

export function format(nodes: ProxyNode[], config?: SingBoxConfig): SingBoxConfig {
  return {
    outbounds: [
      ...nodes.map(formatSingBox),
      ...(config?.outbounds ?? []).filter((node) =>
        ['direct', 'block', 'dns', 'selector', 'urltest'].includes(node.type),
      ),
    ],
  };
}
