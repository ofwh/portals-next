import { appError, errorMessage } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import { getRulesetTransformer, isRulesetTransformer } from '@/lib/subscription/ruleset/transformers/options';
import { ruleSetType } from '@/lib/subscription/schemas/ruleset';
import type { ConfigFormat } from '@/lib/subscription/types/shared';
import type { Parser } from '@/lib/types/workflow';
import { arrayOf, stringValue } from '@/lib/workflow/node/core/schemas';
import type { ConfigIssue, NodeConfigValidationContext } from '@/lib/workflow/node/types';
import { formatOptions } from './definition';
import type { RulesetResolveConfig } from './types';

export function isFormat(value: unknown): value is ConfigFormat {
  return formatOptions.some((format) => format === value);
}

export function isConfig(value: unknown): value is RulesetResolveConfig {
  return (
    isRecord(value) &&
    (isFormat(value.format) || value.format === '') &&
    (((isRulesetTransformer(value.transformer) || value.transformer === '') &&
      Object.keys(value).every((key) => key === 'format' || key === 'transformer')) ||
      ((getRulesetTransformer(value.resolver) !== undefined ||
        value.resolver === '' ||
        value.resolver === 'delimited' ||
        value.resolver === 'structured') &&
        Object.keys(value).every((key) => key === 'format' || key === 'resolver')))
  );
}

export function getConfigTransformer(value: RulesetResolveConfig) {
  return getRulesetTransformer(value.transformer ?? value.resolver);
}

export function validateConfig(value: RulesetResolveConfig, context?: NodeConfigValidationContext): ConfigIssue[] {
  const issues: ConfigIssue[] = [];

  if (!isFormat(value.format)) {
    issues.push({ path: ['format'], message: errorMessage(appError('common.INVALID_PARAMS'), context?.locale) });
  }

  if (!getConfigTransformer(value)) {
    issues.push({ path: ['transformer'], message: errorMessage(appError('common.INVALID_PARAMS'), context?.locale) });
  }

  return issues;
}

export const configSchema: Parser<RulesetResolveConfig> = {
  parse(value) {
    if (!isConfig(value) || !isFormat(value.format)) {
      throw appError('common.INVALID_PARAMS');
    }

    const transformer = getConfigTransformer(value);

    if (!transformer) {
      throw appError('common.INVALID_PARAMS');
    }

    return { format: value.format, transformer };
  },
};
export const inputSchema = stringValue;
export const outputSchema = arrayOf(ruleSetType);
