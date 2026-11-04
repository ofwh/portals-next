import 'server-only';
import { appError } from '@/lib/api';
import { parser as configParser } from '@/lib/subconverter/configuration';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import { parse as parsePolicies } from './parser';
import type { PolicyGroupsConfig, PolicyGroupsOutput } from '../model/types';

export async function execute(
  input: string,
  config: PolicyGroupsConfig,
  context: ExecutionContext,
): Promise<PolicyGroupsOutput> {
  context.signal.throwIfAborted();
  try {
    return parsePolicies(configParser.parse(input, config.type ?? 'ini'));
  } catch {
    throw appError('workflow.CONFIGURATION_PARSE_FAILED');
  }
}
