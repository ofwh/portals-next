import { appError } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import type { SubscriptionFormat } from '@/lib/subconverter/types/subscription';
import type { Parser } from '@/lib/types/workflow';
import { stringValue } from '@/lib/workflow/node/core/schemas';
import { subscriptionFormats } from './definition';
import type { ExtractNodesConfig } from './types';
import { schema } from '../../schema';

export function isSubscriptionFormat(value: unknown): value is SubscriptionFormat {
  return typeof value === 'string' && subscriptionFormats.some((format) => format === value);
}

export function isConfig(value: unknown): value is ExtractNodesConfig {
  return isRecord(value) && isSubscriptionFormat(value.format) && Object.keys(value).every((key) => key === 'format');
}

export const configSchema: Parser<ExtractNodesConfig> = {
  parse(value) {
    if (!isConfig(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return { format: value.format };
  },
};
export const inputSchema = stringValue;

export const outputSchema = schema.proxyNodes;
