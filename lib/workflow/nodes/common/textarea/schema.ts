import { appError } from '@/lib/api';
import type { TextareaConfig } from './types';
import { parseJsonObject } from './utils';
import { isRecord } from '../../../utils';
import { recordOf, stringValue, unionOf, unknownValue } from '../../core/schemas';
import type { Parser } from '../../types';
import { isOutputFormat } from '../schema';

export function isConfig(value: unknown): value is TextareaConfig {
  return isRecord(value) && typeof value.text === 'string' && isOutputFormat(value.outputFormat);
}

export const configSchema: Parser<TextareaConfig> = {
  parse(value) {
    if (!isConfig(value) || Object.keys(value).some((key) => !['text', 'outputFormat'].includes(key))) {
      throw appError('common.INVALID_PARAMS');
    }

    if (value.outputFormat === 'JSON') {
      parseJsonObject(value.text);
    }

    return { text: value.text, outputFormat: value.outputFormat };
  },
};

export const outputSchema = unionOf(stringValue, recordOf(unknownValue));
