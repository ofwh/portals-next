import 'server-only';
import { renameService } from './services';
import type { RenameConfig, RenameOutput, RenameRunInput } from './types';
import type { ExecutionContext } from '../../types';

export async function execute(
  input: RenameRunInput,
  config: RenameConfig,
  context: ExecutionContext,
): Promise<RenameOutput> {
  return renameService.rename(input, config, context);
}
