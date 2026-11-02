import 'server-only';
import type { ExecutionContext } from '@/lib/workflow/nodes/types';
import { default as mergeService } from './service';
import type { MergeConfig, MergeOutput, MergeRunInput } from '../model/types';

export async function execute(
  input: MergeRunInput,
  _config: MergeConfig,
  context: ExecutionContext,
): Promise<MergeOutput> {
  return mergeService.merge(input, context);
}
