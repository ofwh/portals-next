import { appError } from '@/lib/api';
import { arrayOf, unknownValue } from '@/lib/workflow/nodes/core/schemas';
import type { Parser } from '@/lib/workflow/nodes/types';
import { isRecord } from '@/lib/workflow/utils';
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
