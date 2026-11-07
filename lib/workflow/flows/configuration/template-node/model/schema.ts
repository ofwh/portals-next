import { appError, errorMessage } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import { templateType } from '@/lib/subscription/schemas/template';
import { isTemplateFormat } from '@/lib/subscription/shared/template';
import type { Parser } from '@/lib/types/workflow';
import { stringValue } from '@/lib/workflow/node/core/schemas';
import type { ConfigIssue, NodeConfigValidationContext } from '@/lib/workflow/node/types';
import type { TemplateResolveConfig } from './types';

export function isConfig(value: unknown): value is TemplateResolveConfig {
  return isRecord(value) && Object.keys(value).length === 1 && (value.format === '' || isTemplateFormat(value.format));
}

export function validateConfig(value: TemplateResolveConfig, context?: NodeConfigValidationContext): ConfigIssue[] {
  return isTemplateFormat(value.format)
    ? []
    : [{ path: ['format'], message: errorMessage(appError('common.INVALID_PARAMS'), context?.locale) }];
}

export const configSchema: Parser<TemplateResolveConfig> = {
  parse(value) {
    if (!isConfig(value) || !isTemplateFormat(value.format)) {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};
export const inputSchema = stringValue;
export const outputSchema = templateType;
