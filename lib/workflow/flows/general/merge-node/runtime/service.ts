import 'server-only';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import type { MergeOutput, MergeRunInput } from '../model/types';

export async function merge(values: MergeRunInput, context: ExecutionContext): Promise<MergeOutput> {
  context.signal.throwIfAborted();

  return values.flatMap((value): unknown[] => {
    context.signal.throwIfAborted();

    return Array.isArray(value) ? value : [value];
  });
}

const service = { merge };

export default service;
