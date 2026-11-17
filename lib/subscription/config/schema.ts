import { appError } from '@/lib/api';
import { assertJson, isRecord } from '@/lib/shared/data';
import type { NamedType } from '@/lib/types/workflow';
import { CONFIG_TYPES, isConfigType } from '../shared';
import type { ConfigDeclaration, ConfigParameter } from '../types';

function isParameter(value: unknown): value is ConfigParameter {
  return (
    isRecord(value) &&
    ((value.type === 'positional' && Object.keys(value).length === 2 && typeof value.value === 'string') ||
      (value.type === 'named' &&
        Object.keys(value).length === 3 &&
        typeof value.name === 'string' &&
        Object.hasOwn(value, 'value')))
  );
}

function isDeclaration(value: unknown): value is ConfigDeclaration {
  if (!isRecord(value) || Object.keys(value).length !== 2 || !isConfigType(value.type) || !isRecord(value.value)) {
    return false;
  }

  const entry = value.value;
  const keys = value.type === CONFIG_TYPES.CUSTOM ? ['kind', 'parameters'] : ['name', 'kind', 'parameters'];

  return (
    Object.keys(entry).every((key) => keys.includes(key)) &&
    typeof entry.kind === 'string' &&
    (value.type === CONFIG_TYPES.CUSTOM || typeof entry.name === 'string') &&
    Array.isArray(entry.parameters) &&
    entry.parameters.every(isParameter)
  );
}

export const configDeclarationType: NamedType<ConfigDeclaration> = {
  descriptor: { kind: 'ref', id: 'ConfigDeclaration', version: 1 },
  base: { kind: 'record', values: { kind: 'any' } },
  parse(value) {
    assertJson(value);

    if (!isDeclaration(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};
