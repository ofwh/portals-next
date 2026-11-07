import { appError, AppError, errorMessage } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import { compilePattern } from '@/lib/shared/regex';
import { proxyNodeType } from '@/lib/subscription/schemas/proxy-node';
import type { ProxyProtocol } from '@/lib/subscription/types/proxy-node';
import type { Parser } from '@/lib/types/workflow';
import { arrayOf } from '@/lib/workflow/node/core/schemas';
import type { ConfigIssue, NodeConfigValidationContext } from '@/lib/workflow/node/types';
import { protocolOptions } from './definition';
import type { FilterConfig, FilterRule } from './types';

export const inputSchema = arrayOf(proxyNodeType);
export const outputSchema = arrayOf(proxyNodeType);

export function isProtocol(value: unknown): value is ProxyProtocol {
  return typeof value === 'string' && Object.hasOwn(protocolOptions, value);
}

export function isConfig(value: unknown): value is FilterConfig {
  return (
    isRecord(value) &&
    Array.isArray(value.protocols) &&
    value.protocols.every(isProtocol) &&
    (typeof value.namePattern === 'string' ||
      (Array.isArray(value.namePattern) &&
        value.namePattern.every(
          (rule: unknown) => isRecord(rule) && typeof rule.id === 'string' && typeof rule.pattern === 'string',
        ))) &&
    typeof value.exclude === 'boolean'
  );
}

export function getNameRules(config: FilterConfig): FilterRule[] {
  return typeof config.namePattern === 'string'
    ? config.namePattern
      ? [{ id: 'name-pattern', pattern: config.namePattern }]
      : []
    : config.namePattern;
}

export const configSchema: Parser<FilterConfig> = {
  parse(value) {
    if (!isConfig(value) || Object.keys(value).some((key) => !['protocols', 'namePattern', 'exclude'].includes(key))) {
      throw appError('common.INVALID_PARAMS');
    }

    const rules = getNameRules(value);

    for (const rule of rules) {
      const { id, pattern } = rule;

      if (!id || !pattern || Object.keys(rule).some((key) => !['id', 'pattern'].includes(key))) {
        throw appError('common.INVALID_PARAMS');
      }

      compilePattern(pattern);
    }

    return {
      protocols: [...value.protocols],
      namePattern: rules.map(({ id, pattern }) => ({ id, pattern })),
      exclude: value.exclude,
    };
  },
};

export function validateConfig(value: unknown, context?: NodeConfigValidationContext): ConfigIssue[] {
  const issues: ConfigIssue[] = [];

  if (isConfig(value)) {
    getNameRules(value).forEach((rule, index) => {
      try {
        compilePattern(rule.pattern);
      } catch {
        issues.push({
          path: ['namePattern', index, 'pattern'],
          message: errorMessage(appError('common.INVALID_PARAMS'), context?.locale),
        });
      }
    });
  }

  if (issues.length) {
    return issues;
  }

  try {
    configSchema.parse(value);
  } catch (error) {
    return [
      {
        path: [],
        message: errorMessage(error instanceof AppError ? error : appError('common.INVALID_PARAMS'), context?.locale),
      },
    ];
  }

  return [];
}
