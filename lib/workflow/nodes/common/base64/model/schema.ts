import { appError } from '@/lib/api';
import type { Base64Config, Base64Mode } from './types';
import { isRecord } from '../../../../utils';
import { stringValue } from '../../../core/schemas';
import type { Parser } from '../../../types';

export function isMode(value: unknown): value is Base64Mode {
  return value === 'encode' || value === 'decode';
}

export function isConfig(value: unknown): value is Base64Config {
  return isRecord(value) && isMode(value.mode) && Object.keys(value).every((key) => key === 'mode');
}

export const configSchema: Parser<Base64Config> = {
  parse(value) {
    if (!isConfig(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};
export const inputSchema = stringValue;
export const outputSchema = stringValue;
