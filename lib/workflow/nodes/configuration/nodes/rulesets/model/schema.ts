import { appError } from '@/lib/api';
import { stringValue } from '@/lib/workflow/nodes/core/schemas';
import type { Parser } from '@/lib/workflow/nodes/types';
import { isRecord } from '@/lib/workflow/utils';
import type { RuleGroupsConfig } from './types';
import { isConfigurationType } from '../../../utils/configuration';

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
