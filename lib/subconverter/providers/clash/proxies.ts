import type { ProxyNode } from '@/lib/types/subscriptions/nodes';
import { formatClash } from '../../format';
import { normalizeProxy } from '../../normalize';
import type { ClashConfig } from '../../types/clash';

export function parse(config: ClashConfig): ProxyNode[] {
  return (config.proxies ?? config.Proxy ?? []).map(normalizeProxy);
}

export function format(nodes: ProxyNode[], _config?: ClashConfig): ClashConfig {
  return { proxies: nodes.map(formatClash) };
}
