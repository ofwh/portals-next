import 'server-only';
import { compilePattern } from '@/lib/shared/regex';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import { getNameRules } from '../model/schema';
import type { FilterConfig, FilterOutput, FilterRunInput } from '../model/types';

export async function filter(
  nodes: FilterRunInput,
  config: FilterConfig,
  context: ExecutionContext,
): Promise<FilterOutput> {
  context.signal.throwIfAborted();
  const patterns = getNameRules(config).map((rule) => compilePattern(rule.pattern));

  if (!config.protocols.length && !patterns.length) {
    return nodes;
  }

  return nodes.filter((node) => {
    context.signal.throwIfAborted();
    const matches =
      (!config.protocols.length || config.protocols.includes(node.type)) &&
      (!patterns.length ||
        patterns.some((regex) => {
          regex.lastIndex = 0;

          return regex.test(node.name);
        }));

    return config.exclude ? !matches : matches;
  });
}

const service = { filter };

export default service;
