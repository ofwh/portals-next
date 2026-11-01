import 'server-only';
import type { ExecutionContext } from '../../../types';
import { compilePattern } from '../../utils';
import { getNameRules } from '../schema';
import type { FilterConfig, FilterOutput, FilterRunInput } from '../types';

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
