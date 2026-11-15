import 'server-only';
import { rename as renameNodes } from '@/lib/sub/node';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import { compileRules } from '../model/rules';
import type { RenameConfig, RenameOutput, RenameRunInput } from '../model/types';

export async function rename(
  nodes: RenameRunInput,
  config: RenameConfig,
  context: ExecutionContext,
): Promise<RenameOutput> {
  context.signal.throwIfAborted();

  return renameNodes(nodes, compileRules(config.rules), context.signal);
}

const service = { rename };

export default service;
