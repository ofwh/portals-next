import { appError, AppError, errorMessage } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import { compilePattern } from '@/lib/shared/regex';
import type { Parser } from '@/lib/types/workflow';
import type { ConfigIssue, NodeConfigValidationContext } from '@/lib/workflow/node/types';
import type { RenameConfig, RenameRule } from './types';
import { schema } from '../../schema';

export const inputSchema = schema.proxyNodes;
export const outputSchema = schema.proxyNodes;

function isRule(value: unknown): value is RenameRule {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.pattern === 'string' &&
    typeof value.replacement === 'string'
  );
}

export function isConfig(value: unknown): value is RenameConfig {
  return isRecord(value) && Array.isArray(value.rules) && value.rules.every(isRule);
}

export const configSchema: Parser<RenameConfig> = {
  parse(value) {
    if (!isConfig(value) || Object.keys(value).some((key) => key !== 'rules')) {
      throw appError('common.INVALID_PARAMS');
    }

    const rules = value.rules.map((rule) => {
      if (
        !rule.id ||
        !rule.pattern ||
        Object.keys(rule).some((key) => !['id', 'pattern', 'replacement'].includes(key))
      ) {
        throw appError('common.INVALID_PARAMS');
      }

      compilePattern(rule.pattern, 'g');

      return { id: rule.id, pattern: rule.pattern, replacement: rule.replacement };
    });

    return { rules };
  },
};

export function validateConfig(value: unknown, context?: NodeConfigValidationContext): ConfigIssue[] {
  const issues: ConfigIssue[] = [];

  if (isConfig(value)) {
    value.rules.forEach((rule, index) => {
      try {
        compilePattern(rule.pattern, 'g');
      } catch {
        issues.push({
          path: ['rules', index, 'pattern'],
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
