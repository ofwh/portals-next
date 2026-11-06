import { toNative } from '../../providers/schema';
import { SingBoxProvider } from '../../providers/sing-box';
import { singBoxNode, singBoxWireGuardEndpoint } from '../../providers/sing-box/parser';
import type { NativeObject, OutputElements } from '../../types/output';
import { convertNodes, nativeObject } from '../shared/nodes';

export interface NodeProjection {
  region: 'outbounds' | 'endpoints';
  value: NativeObject;
}

export function transform(nodes: OutputElements['nodes']) {
  const result = convertNodes(
    nodes,
    (values) => new SingBoxProvider().transform('node', values),
    (node) => node.tag,
  );

  return {
    ...result,
    entries: result.entries.map((entry) => {
      const node = entry.value;
      const value: NodeProjection =
        node.type === 'wireguard' && 'address' in node
          ? { region: 'endpoints', value: nativeObject(toNative(singBoxWireGuardEndpoint, node)) }
          : { region: 'outbounds', value: nativeObject(toNative(singBoxNode, node)) };

      return { ...entry, value };
    }),
  };
}
