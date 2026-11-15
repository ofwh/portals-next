import 'server-only';
import { compilePattern } from '@/lib/shared/regex';
import { filter as filterNodes } from '@/lib/sub/node';
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

  return filterNodes(nodes, new Set(config.protocols), patterns, config.exclude, context.signal);
}

const service = { filter };

export default service;
