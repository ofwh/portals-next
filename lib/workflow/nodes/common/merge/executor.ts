import 'server-only';
import { mergeService } from './services';
import type { MergeConfig, MergeOutput, MergeRunInput } from './types';
import type { ExecutionContext } from '../../types';

export async function execute(
  input: MergeRunInput,
  _config: MergeConfig,
  context: ExecutionContext,
): Promise<MergeOutput> {
  return mergeService.merge(input, context);
}
