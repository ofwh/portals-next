import { appError } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import { proxyNodeType } from '@/lib/subscription/schemas/proxy-node';
import type { Parser } from '@/lib/types/workflow';
import { arrayOf, stringValue } from '@/lib/workflow/node/core/schemas';
import type { ProxyListConfig } from './types';

export function isConfig(value: unknown): value is ProxyListConfig {
  return isRecord(value) && Object.keys(value).length === 0;
}

export const configSchema: Parser<ProxyListConfig> = {
  parse(value) {
    if (!isConfig(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};
export const inputSchema = stringValue;
export const outputSchema = arrayOf(proxyNodeType);
