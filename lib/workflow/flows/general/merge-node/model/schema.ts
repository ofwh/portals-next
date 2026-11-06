import { appError } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import type { Parser } from '@/lib/types/workflow';
import { arrayOf, unknownValue } from '@/lib/workflow/node/core/schemas';
import type { MergeConfig } from './types';

export function isConfig(value: unknown): value is MergeConfig {
  return isRecord(value) && Object.keys(value).length === 0;
}

export const configSchema: Parser<MergeConfig> = {
  parse(value) {
    if (!isConfig(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};
export const inputSchema = unknownValue;
export const outputSchema = arrayOf(unknownValue);
