import { appError } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import { stringValue } from '@/lib/workflow/nodes/core/schemas';
import type { Parser } from '@/lib/workflow/nodes/types';
import type { PolicyGroupsConfig } from './types';
import { isConfigurationType } from '../../../utils/configuration';

export function isConfig(value: unknown): value is PolicyGroupsConfig {
  return (
    isRecord(value) &&
    Object.keys(value).every((key) => key === 'type') &&
    (!('type' in value) || isConfigurationType(value.type))
  );
}

export const configSchema: Parser<PolicyGroupsConfig> = {
  parse(value) {
    if (!isConfig(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return { type: value.type ?? 'ini' };
  },
};
export const inputSchema = stringValue;

export { policyGroupsSchema as outputSchema } from './output-schema';
