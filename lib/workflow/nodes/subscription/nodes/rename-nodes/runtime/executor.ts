import 'server-only';
import type { ExecutionContext } from '@/lib/workflow/nodes/types';
import { default as renameService } from './service';
import type { RenameConfig, RenameOutput, RenameRunInput } from '../model/types';

export async function execute(
  input: RenameRunInput,
  config: RenameConfig,
  context: ExecutionContext,
): Promise<RenameOutput> {
  return renameService.rename(input, config, context);
}
