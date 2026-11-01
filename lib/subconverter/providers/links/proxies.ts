import type { ProxyNode } from '@/lib/types/subscriptions/nodes';
import { formatLink } from '../../link-format';
import { normalizeProxy } from '../../normalize';
import type { LinksConfig } from '../../types/links';
import { parseShareLink } from '../vendor/links';

export function parse(config: LinksConfig): ProxyNode[] {
  return config.links.map((line, index) => {
    const raw = parseShareLink(line);

    if (!raw) {
      throw new Error('Unsupported sharing link');
    }

    return normalizeProxy(raw, index);
  });
}

export function format(nodes: ProxyNode[], _config?: LinksConfig): LinksConfig {
  return { links: nodes.map(formatLink) };
}
