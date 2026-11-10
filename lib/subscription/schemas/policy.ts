import { appError } from '@/lib/api';
import { assertJson, isRecord, nonempty } from '@/lib/shared/data';
import type { NamedType, TypeDescriptor } from '@/lib/types/workflow';
import { isProxyGroupKind } from '../shared/policy';
import type { GroupHealthCheck, MemberSelector, ProxyGroup } from '../types/policy';

function onlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function isSelector(value: unknown): value is MemberSelector {
  if (!isRecord(value)) {
    return false;
  }

  switch (value.kind) {
    case 'name':
      return onlyKeys(value, ['kind', 'pattern']) && typeof value.pattern === 'string';
    case 'reference':
      return onlyKeys(value, ['kind', 'name']) && nonempty(value.name);
    case 'script':
      return onlyKeys(value, ['kind', 'source']) && nonempty(value.source);
    case 'group':
    case 'group-id':
    case 'insert':
    case 'type':
    case 'port':
    case 'server':
      return (
        onlyKeys(value, ['kind', 'target', 'pattern']) &&
        nonempty(value.target) &&
        (value.pattern === undefined || typeof value.pattern === 'string')
      );
    default:
      return false;
  }
}

function isHealthCheck(value: unknown): value is GroupHealthCheck {
  return (
    isRecord(value) &&
    onlyKeys(value, ['url', 'interval', 'timeout', 'tolerance']) &&
    (value.url === undefined || nonempty(value.url)) &&
    ['interval', 'timeout', 'tolerance'].every(
      (key) => value[key] === undefined || (typeof value[key] === 'number' && Number.isSafeInteger(value[key])),
    )
  );
}

function isProxyGroup(value: unknown): value is ProxyGroup {
  return (
    isRecord(value) &&
    onlyKeys(value, [
      'name',
      'kind',
      'selectors',
      'providerRefs',
      'healthCheck',
      'disableUdp',
      'interruptExistConnections',
      'lazy',
      'evaluateBeforeUse',
      'persistent',
      'strategy',
    ]) &&
    nonempty(value.name) &&
    isProxyGroupKind(value.kind) &&
    Array.isArray(value.selectors) &&
    value.selectors.every(isSelector) &&
    Array.isArray(value.providerRefs) &&
    value.providerRefs.every(nonempty) &&
    (value.healthCheck === undefined || isHealthCheck(value.healthCheck)) &&
    (value.interruptExistConnections === undefined ||
      (value.kind === 'select' && typeof value.interruptExistConnections === 'boolean')) &&
    ['disableUdp', 'lazy', 'evaluateBeforeUse', 'persistent'].every(
      (key) => value[key] === undefined || typeof value[key] === 'boolean',
    ) &&
    (value.strategy === undefined || value.strategy === 'consistent-hashing' || value.strategy === 'round-robin')
  );
}

const selectorStructure: TypeDescriptor = { kind: 'record', values: { kind: 'string' } };
const healthCheckStructure: TypeDescriptor = {
  kind: 'record',
  values: { kind: 'union', types: [{ kind: 'string' }, { kind: 'number' }] },
};

export const proxyGroupType: NamedType<ProxyGroup> = {
  descriptor: { kind: 'ref', id: 'ProxyGroup', version: 1 },
  base: {
    kind: 'record',
    values: {
      kind: 'union',
      types: [
        { kind: 'string' },
        { kind: 'boolean' },
        { kind: 'array', items: { kind: 'string' } },
        { kind: 'array', items: selectorStructure },
        healthCheckStructure,
      ],
    },
  },
  parse(value) {
    assertJson(value);
    if (!isProxyGroup(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};
