import { fail } from './errors';
import type { ProxyNodeFields } from '../../types/proxy-node';
import type { ConvertedNodes, NativeObject } from '../types';

export function convertNodes<N>(
  nodes: readonly ProxyNodeFields[],
  convert: (nodes: readonly ProxyNodeFields[]) => N[],
  name: (value: N) => string | undefined,
): ConvertedNodes<N> {
  const converted = convert(
    nodes.map((fields) => {
      const value = { ...fields };

      delete value.id;
      delete value.sourceId;
      delete value.groupId;
      delete value.group;

      return value;
    }),
  );
  const byName = new Map(converted.map((value) => [name(value), value]));

  if (converted.length !== nodes.length || byName.size !== nodes.length) {
    fail('node', -1, 'nodes', 'unsupported-node-or-dependency');
  }

  return {
    entries: nodes.map((fields, sourceIndex) => {
      const value = byName.get(fields.name);

      if (value === undefined || !fields.name.trim()) {
        return fail('node', sourceIndex, 'name', 'missing-or-ambiguous-name');
      }

      return { sourceIndex, fields, value, symbol: { kind: 'node', inputName: fields.name, outputName: fields.name } };
    }),
    issues: [],
  };
}

export function nativeObject(value: unknown): NativeObject {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return fail('node', -1, 'fields', 'invalid-native-object');
  }

  return value as NativeObject;
}
