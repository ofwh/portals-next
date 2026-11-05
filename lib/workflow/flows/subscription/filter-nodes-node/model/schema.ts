import { appError } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import { compilePattern } from '@/lib/shared/regex';
import type { ProxyType } from '@/lib/subconverter/types';
import type { Parser } from '@/lib/types/workflow';
import { protocolOptions } from './definition';
import type { FilterConfig, FilterRule } from './types';
import { schema } from '../../schema';

export const inputSchema = schema.proxyNodes;
export const outputSchema = schema.proxyNodes;

export function isProtocol(value: unknown): value is ProxyType {
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
