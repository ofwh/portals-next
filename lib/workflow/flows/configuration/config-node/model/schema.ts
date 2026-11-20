import { appError } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import { configDeclarationType } from '@/lib/subscription/config/schema';
import type { Parser } from '@/lib/types/workflow';
import { arrayOf, stringValue } from '@/lib/workflow/node/core/schemas';
import type { ConfigResolveConfig } from './types';

export function isConfig(value: unknown): value is ConfigResolveConfig {
  return isRecord(value) && Object.keys(value).length === 0;
}

export const configSchema: Parser<ConfigResolveConfig> = {
  parse(value) {
    if (!isConfig(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};
export const inputSchema = stringValue;
export const outputSchema = arrayOf(configDeclarationType);
