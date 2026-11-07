import { appError } from '@/lib/api';
import { assertJson, isRecord, nonempty } from '@/lib/shared/data';
import type { NamedType, TypeDescriptor } from '@/lib/types/workflow';
import { isRuleCategory } from '../shared/ruleset';
import type { Rule, RuleSet, RuleSetOptions } from '../types/ruleset';

function stringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function onlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function isRule(value: unknown): value is Rule {
  return (
    isRecord(value) &&
    onlyKeys(value, ['type', 'parameters', 'flags']) &&
    nonempty(value.type) &&
    stringArray(value.parameters) &&
    stringArray(value.flags)
  );
}

function isOptions(value: unknown): value is RuleSetOptions {
  return (
    isRecord(value) &&
    onlyKeys(value, ['noResolve', 'stashFormat']) &&
    (value.noResolve === undefined || typeof value.noResolve === 'boolean') &&
    (value.stashFormat === undefined ||
      value.stashFormat === 'yaml' ||
      value.stashFormat === 'text' ||
      value.stashFormat === 'mrs')
  );
}

function isRuleSet(value: unknown): value is RuleSet {
  if (
    !isRecord(value) ||
    !onlyKeys(value, ['id', 'group', 'category', 'source', 'interval', 'options']) ||
    !nonempty(value.id) ||
    !nonempty(value.group) ||
    !isRuleCategory(value.category) ||
    typeof value.interval !== 'number' ||
    !Number.isSafeInteger(value.interval) ||
    !isOptions(value.options) ||
    !isRecord(value.source)
  ) {
    return false;
  }

  return value.source.kind === 'inline'
    ? onlyKeys(value.source, ['kind', 'rule']) && isRule(value.source.rule)
    : value.source.kind === 'resource' && onlyKeys(value.source, ['kind', 'address']) && nonempty(value.source.address);
}

const stringArrayType: TypeDescriptor = { kind: 'array', items: { kind: 'string' } };
const ruleStructure: TypeDescriptor = {
  kind: 'record',
  values: { kind: 'union', types: [{ kind: 'string' }, stringArrayType] },
};
const optionsStructure: TypeDescriptor = {
  kind: 'record',
  values: { kind: 'union', types: [{ kind: 'boolean' }, { kind: 'string' }] },
};
const sourceStructure: TypeDescriptor = {
  kind: 'record',
  values: { kind: 'union', types: [{ kind: 'string' }, ruleStructure] },
};

export const ruleSetType: NamedType<RuleSet> = {
  descriptor: { kind: 'ref', id: 'RuleSet', version: 1 },
  base: {
    kind: 'record',
    values: { kind: 'union', types: [{ kind: 'string' }, { kind: 'number' }, optionsStructure, sourceStructure] },
  },
  parse(value) {
    assertJson(value);

    if (!isRuleSet(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};
