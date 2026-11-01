import { appError } from '@/lib/api';
import type { MergeConfig } from './types';
import { isRecord } from '../../../../utils';
import { arrayOf, unknownValue } from '../../../core/schemas';
import type { Parser } from '../../../types';

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
