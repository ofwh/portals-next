import { debugNode } from './debug';
import { NODE_ERROR, NodeConversionError, rejectNode } from './errors';
import { get, validateFields } from './mapping';
import type { ProxyType, SupportedNodeFields } from '../types/proxy-node/common';
import type { ProxyNodeFields } from '../types/proxy-node/fields';
import type { Transformer, TransformOptions } from '../types/proxy-node/transform';

export function isSupported<S extends readonly ProxyType[]>(
  node: ProxyNodeFields,
  supports: S,
): node is SupportedNodeFields<S[number]> {
  return supports.includes(node.type);
}

export function createTransform<N, const S extends readonly ProxyType[]>(
  options: TransformOptions<N, S>,
): Transformer<N, SupportedNodeFields<S[number]>> {
  function transform(targetType: 'fields', nodes: readonly N[]): SupportedNodeFields<S[number]>[];
  function transform(targetType: 'node', nodes: readonly ProxyNodeFields[]): N[];
  function transform(targetType: 'fields' | 'node', nodes: readonly unknown[]): (N | SupportedNodeFields<S[number]>)[] {
    const entries: {
      index: number;
      fields: SupportedNodeFields<S[number]>;
      value: N | SupportedNodeFields<S[number]>;
    }[] = [];

    for (const [index, input] of nodes.entries()) {
      try {
        if (targetType === 'fields') {
          const converted = options.toFields(options.readNode(input));
          const collection = Array.isArray(converted) ? converted : [converted];

          for (const fields of collection) {
            if (isSupported(fields, options.supports)) {
              entries.push({ index, fields, value: fields });
            } else {
              debugNode(options.provider, targetType, index, NODE_ERROR.UNSUPPORTED_PROTOCOL, fields);
            }
          }
        } else {
          const fields = validateFields(input);

          if (isSupported(fields, options.supports)) {
            entries.push({ index, fields, value: options.toNode(fields) });
          } else {
            debugNode(options.provider, targetType, index, NODE_ERROR.UNSUPPORTED_PROTOCOL, input);
          }
        }
      } catch (error) {
        debugNode(
          options.provider,
          targetType,
          index,
          error instanceof NodeConversionError
            ? error.reason
            : error instanceof Error
              ? error.message
              : NODE_ERROR.INVALID_NODE_DATA,
          input,
        );
      }
    }

    const names = new Map<string, typeof entries>();
    const status = new Map<(typeof entries)[number], boolean>();

    for (const entry of entries) {
      const named = names.get(entry.fields.name) ?? [];

      named.push(entry);
      names.set(entry.fields.name, named);
    }
    for (const entry of entries) {
      const path: typeof entries = [];
      const visited = new Set<(typeof entries)[number]>();
      let current = entry;
      let valid = true;

      while (true) {
        if (status.has(current)) {
          valid = status.get(current) === true;
          break;
        }

        if (visited.has(current)) {
          valid = false;
          break;
        }

        visited.add(current);
        path.push(current);
        const dependency = get(current.fields, 'underlyingProxy');

        if (dependency === undefined) {
          break;
        }

        const targets = typeof dependency === 'string' ? names.get(dependency) : undefined;

        if (!targets || targets.length !== 1) {
          valid = false;
          break;
        }

        current = targets[0];
      }
      for (const item of path) {
        status.set(item, valid);
      }
    }

    return entries
      .filter((entry) => {
        if (status.get(entry) === false) {
          debugNode(
            options.provider,
            targetType,
            entry.index,
            NODE_ERROR.MISSING_AMBIGUOUS_OR_CYCLIC_DEPENDENCY,
            entry.fields,
          );

          return false;
        }

        return true;
      })
      .map((entry) => entry.value);
  }

  return transform;
}

export function supportsType<T extends ProxyType>(value: string, supports: readonly T[]): T {
  const type = supports.find((item) => item === value);

  if (!type) {
    return rejectNode(NODE_ERROR.UNSUPPORTED_PROTOCOL);
  }

  return type;
}
