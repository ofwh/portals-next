import { appError } from '@/lib/api';
import { protocolOptions } from './definition';
import type { FilterConfig, FilterRule } from './types';
import { isRecord } from '../../../../utils';
import { arrayOf, unknownValue } from '../../../core/schemas';
import type { Parser } from '../../../types';
import type { SubscriptionProtocol } from '../../types';
import { compilePattern } from '../../utils';

export { subscriptionNodesSchema as outputSchema } from '../../schema';

export const inputSchema = arrayOf(unknownValue);

export function isProtocol(value: unknown): value is SubscriptionProtocol {
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

    for (const { id, pattern } of rules) {
      if (!id || !pattern) {
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
