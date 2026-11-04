import { appError } from '@/lib/api';
import type { OutputTarget } from '@/lib/subconverter/output/types';
import { policyGroupsSchema } from '@/lib/workflow/nodes/configuration/nodes/policies/model/output-schema';
import { ruleGroupsSchema } from '@/lib/workflow/nodes/configuration/nodes/rulesets/model/output-schema';
import { stringValue, unionOf } from '@/lib/workflow/nodes/core/schemas';
import type { Parser } from '@/lib/workflow/nodes/types';
import { isRecord } from '@/lib/workflow/utils';
import { outputFormats } from './definition';
import type { GenerateSubscriptionConfig } from './types';
import { proxyNodesSchema } from '../../../proxy-node-schema';

export function isOutputFormat(value: unknown): value is OutputTarget {
  return typeof value === 'string' && outputFormats.some((format) => format === value);
}

export function isConfig(value: unknown): value is GenerateSubscriptionConfig {
  return isRecord(value) && isOutputFormat(value.format) && Object.keys(value).every((key) => key === 'format');
}

export const configSchema: Parser<GenerateSubscriptionConfig> = {
  parse(value) {
    if (!isConfig(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return { format: value.format };
  },
};
export const inputSchema = unionOf(proxyNodesSchema, unionOf(ruleGroupsSchema, policyGroupsSchema));
export const outputSchema = stringValue;
