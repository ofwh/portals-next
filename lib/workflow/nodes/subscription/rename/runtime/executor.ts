import 'server-only';
import { default as renameService } from './service';
import type { ExecutionContext } from '../../../types';
import type { RenameConfig, RenameOutput, RenameRunInput } from '../model/types';

export async function execute(
  input: RenameRunInput,
  config: RenameConfig,
  context: ExecutionContext,
): Promise<RenameOutput> {
  return renameService.rename(input, config, context);
}
