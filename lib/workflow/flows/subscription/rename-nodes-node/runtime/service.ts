import 'server-only';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import { applyRules, compileRules } from '../model/rules';
import type { RenameConfig, RenameOutput, RenameRunInput } from '../model/types';

export async function rename(
  nodes: RenameRunInput,
  config: RenameConfig,
  context: ExecutionContext,
): Promise<RenameOutput> {
  context.signal.throwIfAborted();
  const rules = compileRules(config.rules);

  return nodes.map((node) => {
    context.signal.throwIfAborted();
    const name = applyRules(node.name, rules);

    return { ...node, name };
  });
}

const service = { rename };

export default service;
