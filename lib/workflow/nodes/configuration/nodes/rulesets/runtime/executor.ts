import 'server-only';
import { appError } from '@/lib/api';
import { parser as configParser } from '@/lib/subconverter/configuration';
import type { ExecutionContext } from '@/lib/workflow/nodes/types';
import { parse as parseRules } from './parser';
import type { RuleGroupsConfig, RuleGroupsOutput } from '../model/types';

export async function execute(
  input: string,
  config: RuleGroupsConfig,
  context: ExecutionContext,
): Promise<RuleGroupsOutput> {
  context.signal.throwIfAborted();
  try {
    return parseRules(configParser.parse(input, config.type ?? 'ini'));
  } catch {
    throw appError('workflow.CONFIGURATION_PARSE_FAILED');
  }
}
