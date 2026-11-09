import { appError, errorMessage } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import { proxyGroupType } from '@/lib/subscription/schemas/policy';
import { proxyNodeType } from '@/lib/subscription/schemas/proxy-node';
import { ruleSetType } from '@/lib/subscription/schemas/ruleset';
import { templateType } from '@/lib/subscription/schemas/template';
import { isCompileTarget } from '@/lib/subscription/shared/compile';
import type { Parser, ValueSchema } from '@/lib/types/workflow';
import { arrayOf, stringValue, unionOf } from '@/lib/workflow/node/core/schemas';
import type { ConfigIssue, NodeConfigValidationContext } from '@/lib/workflow/node/types';
import type { CompileNodeConfig, CompileNodeValue } from './types';

export function isConfig(value: unknown): value is CompileNodeConfig {
  return isRecord(value) && Object.keys(value).length === 1 && (value.target === '' || isCompileTarget(value.target));
}

export function validateConfig(value: CompileNodeConfig, context?: NodeConfigValidationContext): ConfigIssue[] {
  return isCompileTarget(value.target)
    ? []
    : [{ path: ['target'], message: errorMessage(appError('common.INVALID_PARAMS'), context?.locale) }];
}

export const configSchema: Parser<CompileNodeConfig> = {
  parse(value) {
    if (!isConfig(value) || !isCompileTarget(value.target)) {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};
export const inputSchema: ValueSchema<CompileNodeValue> = unionOf(
  unionOf(arrayOf(proxyNodeType), arrayOf(proxyGroupType)),
  unionOf(arrayOf(ruleSetType), templateType),
);
export const outputSchema = stringValue;
