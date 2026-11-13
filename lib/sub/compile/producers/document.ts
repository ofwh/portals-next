import { stringify } from 'yaml';
import type { CompiledNode, Source, SubscriptionType } from '../types';

export function assemble(target: SubscriptionType, nodes: readonly CompiledNode[]): string {
  if (!nodes.length) {
    return '';
  }

  if (target === 'clash') {
    return stringify({ proxies: nodes.map((node) => node.value) }).trimEnd();
  }

  if (target === 'singbox') {
    const collections: Partial<Record<'outbounds' | 'endpoints', Source[]>> = {};

    for (const node of nodes) {
      (collections[node.collection ?? 'outbounds'] ??= []).push(node.value);
    }

    return JSON.stringify(collections);
  }

  const content = nodes.map((node) => node.content).join('\n');

  if (target === 'mixed') {
    return content;
  }

  const sections = nodes
    .flatMap((node) => node.sections)
    .map((section) => {
      const entries = Object.entries(section.entries).map(([key, value]) => `${key} = ${String(value)}`);

      return [`[${section.name}]`, ...entries].join('\n');
    });

  return [`[${target === 'quanx' ? 'server_local' : 'Proxy'}]\n${content}`, ...sections].join('\n\n');
}
