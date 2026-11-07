import { appError, errorMessage } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import { isPolicyTransformer } from '@/lib/subscription/policy/transformers';
import { proxyGroupType } from '@/lib/subscription/schemas/policy';
import type { ConfigFormat } from '@/lib/subscription/types/shared';
import type { Parser } from '@/lib/types/workflow';
import { arrayOf, stringValue } from '@/lib/workflow/node/core/schemas';
import type { ConfigIssue, NodeConfigValidationContext } from '@/lib/workflow/node/types';
import { formatOptions } from './definition';
import type { PolicyResolveConfig } from './types';

export function isFormat(value: unknown): value is ConfigFormat {
  return formatOptions.some((format) => format === value);
}

export function isConfig(value: unknown): value is PolicyResolveConfig {
  return (
    isRecord(value) &&
    (isFormat(value.format) || value.format === '') &&
    (((isPolicyTransformer(value.transformer) || value.transformer === '') &&
      Object.keys(value).every((key) => key === 'format' || key === 'transformer')) ||
      ((value.resolver === 'legacy-delimited' || value.resolver === 'legacy-object' || value.resolver === '') &&
        Object.keys(value).every((key) => key === 'format' || key === 'resolver')))
  );
}

export function validateConfig(value: PolicyResolveConfig, context?: NodeConfigValidationContext): ConfigIssue[] {
  const issues: ConfigIssue[] = [];

  if (!isFormat(value.format)) {
    issues.push({ path: ['format'], message: errorMessage(appError('common.INVALID_PARAMS'), context?.locale) });
  }

  if (!isPolicyTransformer(value.transformer)) {
    issues.push({ path: ['transformer'], message: errorMessage(appError('common.INVALID_PARAMS'), context?.locale) });
  }

  return issues;
}

export const configSchema: Parser<PolicyResolveConfig> = {
  parse(value) {
    if (!isConfig(value) || !isFormat(value.format)) {
      throw appError('common.INVALID_PARAMS');
    }

    if (!isPolicyTransformer(value.transformer)) {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};
export const inputSchema = stringValue;
export const outputSchema = arrayOf(proxyGroupType);
