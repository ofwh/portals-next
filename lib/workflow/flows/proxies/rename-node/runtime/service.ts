import 'server-only';
import renameService from '@/lib/subscription/processors/rename';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import { compileRules } from '../model/rules';
import type { RenameConfig, RenameOutput, RenameRunInput } from '../model/types';

export async function rename(
  nodes: RenameRunInput,
  config: RenameConfig,
  context: ExecutionContext,
): Promise<RenameOutput> {
  context.signal.throwIfAborted();

  return renameService.rename(nodes, compileRules(config.rules), context.signal);
}

const service = { rename };

export default service;
