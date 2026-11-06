import { appError } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import type { Parser } from '@/lib/types/workflow';
import { recordOf, stringValue, unionOf, unknownValue } from '@/lib/workflow/node/core/schemas';
import type { ConfiguredType } from '@/lib/workflow/node/types';
import { parseJsonObject } from './json';
import type { FieldInputConfig, OutputFormat } from './types';

export function isOutputFormat(value: unknown): value is OutputFormat {
  return value === 'String' || value === 'Object';
}

export function isConfig(value: unknown): value is FieldInputConfig {
  return isRecord(value) && typeof value.text === 'string' && isOutputFormat(value.outputFormat);
}

export const configSchema: Parser<FieldInputConfig> = {
  parse(value) {
    if (!isConfig(value) || Object.keys(value).some((key) => !['text', 'outputFormat'].includes(key))) {
      throw appError('common.INVALID_PARAMS');
    }

    if (value.outputFormat === 'Object') {
      parseJsonObject(value.text);
    }

    return { text: value.text, outputFormat: value.outputFormat };
  },
};

export const outputSchema = unionOf(stringValue, recordOf(unknownValue));
export const outputTypeByConfig: ConfiguredType = {
  field: 'outputFormat',
  types: { String: stringValue.descriptor, Object: recordOf(unknownValue).descriptor },
};
