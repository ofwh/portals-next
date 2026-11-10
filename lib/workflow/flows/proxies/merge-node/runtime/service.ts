import 'server-only';
import { isRecord } from '@/lib/shared/data';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import type { MergeOutput, MergeRunInput } from '../model/types';

export async function merge(values: MergeRunInput, context: ExecutionContext): Promise<MergeOutput> {
  context.signal.throwIfAborted();

  const names = new Set<string>();
  const reservedNames = new Set<string>();
  const indexes = new Map<string, number>();
  const nodes = values.flatMap((value): unknown[] => {
    context.signal.throwIfAborted();

    return Array.isArray(value) ? value : [value];
  });

  for (const node of nodes) {
    context.signal.throwIfAborted();

    if (isRecord(node) && typeof node.name === 'string') {
      reservedNames.add(node.name);
    }
  }

  return nodes.map((value) => {
    context.signal.throwIfAborted();

    if (!isRecord(value) || typeof value.name !== 'string') {
      return value;
    }

    const originalName = value.name;
    let name = originalName;
    let index = indexes.get(originalName) ?? 0;

    if (names.has(originalName)) {
      do {
        index += 1;
        name = `${originalName} ${index}`;
      } while (names.has(name) || reservedNames.has(name));
    }

    names.add(name);
    indexes.set(originalName, index);

    return name === originalName ? value : { ...value, name };
  });
}

const service = { merge };

export default service;
