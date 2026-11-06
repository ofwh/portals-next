import { appError, errorMessage } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import { isConfigurationClient, isConfigurationType } from '@/lib/subconverter/configuration/options';
import type { Parser } from '@/lib/types/workflow';
import { stringValue } from '@/lib/workflow/node/core/schemas';
import type { ConfigIssue, NodeConfigValidationContext } from '@/lib/workflow/node/types';
import type { RuleGroupsConfig } from './types';

export function isConfig(value: unknown): value is RuleGroupsConfig {
  return (
    isRecord(value) &&
    Object.keys(value).every((key) => key === 'type' || key === 'client') &&
    (!('type' in value) || isConfigurationType(value.type)) &&
    (!('client' in value) || typeof value.client === 'string')
  );
}

export const configSchema: Parser<RuleGroupsConfig> = {
  parse(value) {
    if (!isConfig(value) || !isConfigurationClient(value.client ?? 'clash')) {
      throw appError('common.INVALID_PARAMS');
    }

    return { type: value.type ?? 'ini', client: value.client ?? 'clash' };
  },
};
export const inputSchema = stringValue;

export { ruleGroupsSchema as outputSchema } from './output-schema';

export function validateConfig(value: unknown, context?: NodeConfigValidationContext): ConfigIssue[] {
  if (isConfig(value) && isConfigurationClient(value.client ?? 'clash')) {
    return [];
  }

  return [{ path: ['client'], message: errorMessage(appError('common.INVALID_PARAMS'), context?.locale) }];
}
