import 'server-only';
import { appError } from '@/lib/api';
import type { ExecutionContext } from '../../../types';
import { compilePattern } from '../../utils';
import type { RenameConfig, RenameOutput, RenameRunInput } from '../types';

export async function rename(
  nodes: RenameRunInput,
  config: RenameConfig,
  context: ExecutionContext,
): Promise<RenameOutput> {
  context.signal.throwIfAborted();
  const rules = config.rules.map((rule) => ({
    regex: compilePattern(rule.pattern, 'g'),
    replacement: rule.replacement,
  }));

  return nodes.map((node) => {
    context.signal.throwIfAborted();
    let name = node.name;

    for (const rule of rules) {
      name = name.replace(rule.regex, rule.replacement);
    }
    if (!name.trim()) {
      throw appError('workflow.SUBSCRIPTION_EMPTY_NAME');
    }

    return { ...node, name };
  });
}

const service = { rename };

export default service;
