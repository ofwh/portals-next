import { NODE_ERROR } from '@/lib/subconverter/proxy-node/errors';
import { debugNode } from '../proxy-node/debug';
import type { Reader } from '../types/providers/schema';

export function nodeItems<T>(read: Reader<T>, provider: string): Reader<T[]> {
  return (value) => {
    if (!Array.isArray(value)) {
      throw new Error('Expected a node array');
    }

    const result: T[] = [];

    for (const [index, item] of value.entries()) {
      try {
        result.push(read(item));
      } catch (error) {
        debugNode(
          provider,
          'parse',
          index,
          error instanceof Error ? error.message : NODE_ERROR.INVALID_OR_UNSUPPORTED_NODE,
          item,
        );
      }
    }

    return result;
  };
}
