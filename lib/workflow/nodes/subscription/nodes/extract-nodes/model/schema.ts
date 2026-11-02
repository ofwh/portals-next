import { appError } from '@/lib/api';
import { stringValue } from '@/lib/workflow/nodes/core/schemas';
import type { Parser } from '@/lib/workflow/nodes/types';
import { isRecord } from '@/lib/workflow/utils';
import { subscriptionFormats } from './definition';
import type { ExtractNodesConfig, SubscriptionFormat } from './types';

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

export { proxyNodesSchema as outputSchema } from '../../../proxy-node-schema';
