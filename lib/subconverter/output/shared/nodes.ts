import { fail, OutputError } from './errors';
import type { ConvertedNode, ConvertedNodes, NativeObject, OutputIssue } from '../../types/output';
import type { ProxyNodeFields } from '../../types/proxy-node';

export function convertNodes<N>(
  nodes: readonly ProxyNodeFields[],
  convert: (nodes: readonly ProxyNodeFields[]) => N[],
  name: (value: N) => string | undefined,
): ConvertedNodes<N> {
  const names = new Set<string>();

  nodes.forEach((node, index) => {
    if (!node.name.trim() || names.has(node.name)) {
      fail('node', index, 'name', 'missing-or-ambiguous-name');
    }

    names.add(node.name);
  });
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
  const byName = new Map<string, N>();

  for (const value of converted) {
    const outputName = name(value);

    if (outputName === undefined || !names.has(outputName) || byName.has(outputName)) {
      fail('node', -1, 'name', 'missing-or-ambiguous-name');
    }

    byName.set(outputName, value);
  }

  const entries: ConvertedNode<N>[] = [];
  const issues: OutputIssue[] = [];

  for (const [sourceIndex, fields] of nodes.entries()) {
    const value = byName.get(fields.name);

    if (value === undefined) {
      issues.push({ stage: 'node', index: sourceIndex, field: 'nodes', message: 'unsupported-node-or-dependency' });

      continue;
    }

    entries.push({
      sourceIndex,
      fields,
      value,
      symbol: { kind: 'node', inputName: fields.name, outputName: fields.name },
    });
  }

  return { entries, issues };
}

export function filterUnsupportedNodes<N>(
  nodes: readonly ProxyNodeFields[],
  transform: (nodes: readonly ProxyNodeFields[]) => ConvertedNodes<N>,
): ConvertedNodes<N> {
  const selected = nodes.map((fields, sourceIndex) => ({ fields, sourceIndex }));
  const issues: OutputIssue[] = [];

  while (true) {
    try {
      const result = transform(selected.map((entry) => entry.fields));

      return {
        entries: result.entries.map((entry) => ({ ...entry, sourceIndex: selected[entry.sourceIndex].sourceIndex })),
        issues: [
          ...issues,
          ...result.issues.map((issue) => ({
            ...issue,
            ...(issue.index !== undefined && issue.index >= 0 ? { index: selected[issue.index].sourceIndex } : {}),
          })),
        ],
      };
    } catch (error) {
      if (
        !(error instanceof OutputError) ||
        error.stage !== 'node' ||
        !selected[error.index] ||
        (!error.message.startsWith('unsupported-') && error.message !== 'inconsistent-loon-wireguard-keepalive')
      ) {
        throw error;
      }

      const [removed] = selected.splice(error.index, 1);

      issues.push({ stage: 'node', index: removed.sourceIndex, field: error.field, message: error.message });
    }
  }
}

export function nativeObject(value: unknown): NativeObject {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return fail('node', -1, 'fields', 'invalid-native-object');
  }

  return value as NativeObject;
}
