import 'server-only';
import { appError } from '@/lib/api';
import { parser as configParser } from '@/lib/subconverter/configuration';
import { isConfigurationClient } from '@/lib/subconverter/configuration/options';
import { parse as parseRules } from '@/lib/subconverter/rulesets';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import type { RuleGroupsConfig, RuleGroupsOutput } from '../model/types';

export async function execute(
  input: string,
  config: RuleGroupsConfig,
  context: ExecutionContext,
): Promise<RuleGroupsOutput> {
  context.signal.throwIfAborted();
  try {
    const client = config.client ?? 'clash';

    if (!isConfigurationClient(client)) {
      throw appError('common.INVALID_PARAMS');
    }

    return parseRules(configParser.parse(input, config.type ?? 'ini'), client);
  } catch {
    const failure = appError('workflow.CONFIGURATION_PARSE_FAILED');

    throw failure;
  }
}
