import { appError } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import type { OutputTarget } from '@/lib/subconverter/types/output';
import type { Parser } from '@/lib/types/workflow';
import { policyGroupsSchema } from '@/lib/workflow/flows/configuration/policies-node/model/output-schema';
import { ruleGroupsSchema } from '@/lib/workflow/flows/configuration/rulesets-node/model/output-schema';
import { stringValue, unionOf } from '@/lib/workflow/node/core/schemas';
import { outputFormats } from './definition';
import type { GenerateSubscriptionConfig } from './types';
import { proxyNodesSchema } from '../../schema';

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
