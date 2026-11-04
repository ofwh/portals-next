import { ClashProvider } from '../../providers/clash';
import { clashProxyNode } from '../../providers/clash/parser';
import { toNative } from '../../providers/schema';
import type { ProxyNodeFields } from '../../types/proxy-node';
import { convertNodes, nativeObject } from '../shared/nodes';

export function transform(nodes: readonly ProxyNodeFields[]) {
  const result = convertNodes(
    nodes,
    (values) => new ClashProvider().transform('node', values),
    (node) => node.name,
  );

  return {
    ...result,
    entries: result.entries.map((entry) => ({ ...entry, value: nativeObject(toNative(clashProxyNode, entry.value)) })),
  };
}
