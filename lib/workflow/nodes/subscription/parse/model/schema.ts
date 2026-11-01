import { appError } from '@/lib/api';
import { subscriptionFormats } from './definition';
import type { ParseConfig, SubscriptionFormat } from './types';
import { isRecord } from '../../../../utils';
import { outputSchema as httpResponseSchema } from '../../../common/http-request/model/schema';
import { recordOf, stringValue, unionOf, unknownValue } from '../../../core/schemas';
import type { Parser } from '../../../types';

export function isSubscriptionFormat(value: unknown): value is SubscriptionFormat {
  return typeof value === 'string' && subscriptionFormats.some((format) => format === value);
}

export function isConfig(value: unknown): value is ParseConfig {
  return isRecord(value) && isSubscriptionFormat(value.format);
}

export const configSchema: Parser<ParseConfig> = {
  parse(value) {
    if (!isConfig(value) || Object.keys(value).some((key) => key !== 'format')) {
      throw appError('common.INVALID_PARAMS');
    }

    return { format: value.format };
  },
};
export const inputSchema = unionOf(unionOf(stringValue, httpResponseSchema), recordOf(unknownValue));

export { subscriptionNodesSchema as outputSchema } from '../../schema';
