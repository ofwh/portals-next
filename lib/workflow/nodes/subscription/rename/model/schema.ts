import { appError } from '@/lib/api';
import type { RenameConfig, RenameRule } from './types';
import { isRecord } from '../../../../utils';
import { arrayOf, unknownValue } from '../../../core/schemas';
import type { Parser } from '../../../types';
import { compilePattern } from '../../utils';

export { subscriptionNodesSchema as outputSchema } from '../../schema';

export const inputSchema = arrayOf(unknownValue);

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
