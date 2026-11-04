import { appError } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import type { Parser } from '@/lib/types/workflow';
import { stringValue } from '@/lib/workflow/node/core/schemas';
import type { RuleGroupsConfig } from './types';
import { isConfigurationType } from '../../utils/configuration';

export function isConfig(value: unknown): value is RuleGroupsConfig {
  return (
    isRecord(value) &&
    Object.keys(value).every((key) => key === 'type') &&
    (!('type' in value) || isConfigurationType(value.type))
  );
}

export const configSchema: Parser<RuleGroupsConfig> = {
  parse(value) {
    if (!isConfig(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return { type: value.type ?? 'ini' };
  },
};
export const inputSchema = stringValue;

export { ruleGroupsSchema as outputSchema } from './output-schema';
