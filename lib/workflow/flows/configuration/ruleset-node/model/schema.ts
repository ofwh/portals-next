import { appError, errorMessage } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import { ruleSetType } from '@/lib/subscription/schemas/ruleset';
import { getRulesetResolver } from '@/lib/subscription/shared/ruleset';
import type { RulesetFormat } from '@/lib/subscription/types/ruleset';
import type { Parser } from '@/lib/types/workflow';
import { arrayOf, stringValue } from '@/lib/workflow/node/core/schemas';
import type { ConfigIssue, NodeConfigValidationContext } from '@/lib/workflow/node/types';
import { formatOptions } from './definition';
import type { RulesetResolveConfig } from './types';

export function isFormat(value: unknown): value is RulesetFormat {
  return formatOptions.some((format) => format === value);
}

export function isConfig(value: unknown): value is RulesetResolveConfig {
  return (
    isRecord(value) &&
    (isFormat(value.format) || value.format === '') &&
    (getRulesetResolver(value.resolver) !== undefined ||
      value.resolver === '' ||
      value.resolver === 'delimited' ||
      value.resolver === 'structured') &&
    Object.keys(value).every((key) => key === 'format' || key === 'resolver')
  );
}

export function validateConfig(value: RulesetResolveConfig, context?: NodeConfigValidationContext): ConfigIssue[] {
  const issues: ConfigIssue[] = [];

  if (!isFormat(value.format)) {
    issues.push({ path: ['format'], message: errorMessage(appError('common.INVALID_PARAMS'), context?.locale) });
  }

  if (!getRulesetResolver(value.resolver)) {
    issues.push({ path: ['resolver'], message: errorMessage(appError('common.INVALID_PARAMS'), context?.locale) });
  }

  return issues;
}

export const configSchema: Parser<RulesetResolveConfig> = {
  parse(value) {
    if (!isConfig(value) || !isFormat(value.format)) {
      throw appError('common.INVALID_PARAMS');
    }

    const resolver = getRulesetResolver(value.resolver);

    if (!resolver) {
      throw appError('common.INVALID_PARAMS');
    }

    return { ...value, resolver };
  },
};
export const inputSchema = stringValue;
export const outputSchema = arrayOf(ruleSetType);
