import 'server-only';
import { default as mergeService } from './service';
import type { ExecutionContext } from '../../../types';
import type { MergeConfig, MergeOutput, MergeRunInput } from '../model/types';

export async function execute(
  input: MergeRunInput,
  _config: MergeConfig,
  context: ExecutionContext,
): Promise<MergeOutput> {
  return mergeService.merge(input, context);
}
