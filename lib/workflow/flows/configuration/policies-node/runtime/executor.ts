import 'server-only';
import { appError } from '@/lib/api';
import { parser as configParser } from '@/lib/subconverter/configuration';
import { isConfigurationClient } from '@/lib/subconverter/configuration/options';
import { parse as parsePolicies } from '@/lib/subconverter/policies';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import type { PolicyGroupsConfig, PolicyGroupsOutput } from '../model/types';

export async function execute(
  input: string,
  config: PolicyGroupsConfig,
  context: ExecutionContext,
): Promise<PolicyGroupsOutput> {
  context.signal.throwIfAborted();
  try {
    const client = config.client ?? 'clash';

    if (!isConfigurationClient(client)) {
      throw appError('common.INVALID_PARAMS');
    }

    return parsePolicies(configParser.parse(input, config.type ?? 'ini'), client);
  } catch {
    const failure = appError('workflow.CONFIGURATION_PARSE_FAILED');

    throw failure;
  }
}
