import { appError } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import { isTemplateFormat } from '@/lib/subconverter/template/formats';
import type { Parser } from '@/lib/types/workflow';
import { stringValue } from '@/lib/workflow/node/core/schemas';
import type { ParseTemplateConfig } from './types';
import { schema } from '../../schema';

export { isTemplateFormat } from '@/lib/subconverter/template/formats';

export function isConfig(value: unknown): value is ParseTemplateConfig {
  return isRecord(value) && isTemplateFormat(value.format) && Object.keys(value).every((key) => key === 'format');
}

export const configSchema: Parser<ParseTemplateConfig> = {
  parse(value) {
    if (!isConfig(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return { format: value.format };
  },
};
export const inputSchema = stringValue;

export const outputSchema = schema.template;
