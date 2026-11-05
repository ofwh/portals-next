import { combine } from './combine';
import { toNative } from '../../providers/schema';
import { SSProvider } from '../../providers/ss';
import { ssProxyNode } from '../../providers/ss/parser';
import type { NativeObject, OutputAdapter } from '../../types/output';
import { convertNodes, nativeObject } from '../shared/nodes';
import { ssNode } from '../shared/ss';

export const adapter: OutputAdapter<NativeObject, never[], never[], NativeObject[]> = {
  target: 'sssub',
  mediaType: 'application/json',
  nodes: {
    transform: (nodes) => {
      const result = convertNodes(
        nodes,
        (values) =>
          new SSProvider().transform(
            'node',
            values.flatMap((node) => {
              const compatible = ssNode(node);

              return compatible ? [compatible] : [];
            }),
          ),
        (node) => node.remarks,
      );

      return {
        ...result,
        entries: result.entries.map((entry) => ({ ...entry, value: nativeObject(toNative(ssProxyNode, entry.value)) })),
      };
    },
  },
  policies: { transform: () => ({ value: [], symbols: [], issues: [] }) },
  rules: { transform: () => ({ value: [], issues: [] }) },
  combine,
  toString: (config) => JSON.stringify(config, null, 2) + '\n',
};
