import { parseMembers } from './selectors';
import type { GroupDeclaration } from './types';
import { POLICY_ERROR_CODES } from '../../shared/errors';
import { isProxyGroupKind } from '../../shared/policy';
import { textLimits } from '../../shared/text';
import type { GroupHealthCheck, ProxyGroup, ProxyGroupKind } from '../../types/policy';
import { EntryError } from '../diagnostics';

export function text(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_ENTRY, field);
  }

  if (value.length > textLimits.line) {
    throw new EntryError(POLICY_ERROR_CODES.INPUT_TOO_LARGE, field);
  }

  return value.trim();
}

export function groupKind(value: unknown): ProxyGroupKind {
  if (!isProxyGroupKind(value)) {
    throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_CATEGORY, 'type');
  }

  return value;
}

export function stringList(value: unknown, field: string): string[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_ENTRY, field);
  }

  return value.map((item: unknown) => text(item, field));
}

export function integer(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_OPTIONS, field);
  }

  return value;
}

export function legacyInteger(value: string): number {
  const match = /^\s*([+-]?\d+)/.exec(value);
  const number = match ? Number(match[1]) : 0;

  if (!Number.isSafeInteger(number)) {
    throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_OPTIONS, 'interval');
  }

  return number;
}

export function forbidImport(value: unknown): void {
  if (
    (typeof value === 'string' && value.trim().startsWith('!!import:')) ||
    (typeof value === 'object' && value !== null && Object.hasOwn(value, 'import'))
  ) {
    throw new EntryError(POLICY_ERROR_CODES.POLICY_IMPORT_FORBIDDEN);
  }
}

export function takeSelectUrl(rules: string[], url?: string): string | undefined {
  if (!url && /^https?:\/\//i.test(rules.at(-1) ?? '')) {
    return rules.pop();
  }

  return url;
}

export function booleanOption(declaration: GroupDeclaration, field: string): boolean | undefined {
  const value = declaration.fields[field];

  if (value !== undefined && typeof value !== 'boolean') {
    throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_OPTIONS, field);
  }

  return value;
}

export function resolveMembers(declaration: GroupDeclaration, rules = declaration.rules): ProxyGroup {
  const members = parseMembers(rules, declaration.providers);

  if (members.selectors.length === 0 && members.providerRefs.length === 0 && !declaration.policyPath) {
    throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_ENTRY, 'rule');
  }

  const disableUdp = booleanOption(declaration, 'disable-udp');

  return {
    name: declaration.name,
    kind: declaration.kind,
    ...members,
    ...(declaration.policyPath ? { policyPath: declaration.policyPath } : {}),
    ...(declaration.flags !== undefined ? { flags: declaration.flags } : {}),
    ...(disableUdp !== undefined ? { disableUdp } : {}),
  };
}

export function resolveTestGroup(declaration: GroupDeclaration, tolerance: boolean): ProxyGroup {
  const rules = [...declaration.rules];
  const fields = declaration.fields;
  let healthCheck: GroupHealthCheck;

  if (declaration.syntax === 'delimited') {
    if (rules.length < (declaration.policyPath ? 2 : 3)) {
      throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_ENTRY, 'rule');
    }

    const times = rules.pop()!.split(',');

    healthCheck = {
      url: text(rules.pop(), 'url'),
      interval: legacyInteger(times[0]),
      timeout: times[1] === undefined ? 0 : legacyInteger(times[1]),
    };
    if (tolerance) {
      healthCheck.tolerance = times[2] === undefined ? 0 : legacyInteger(times[2]);
    }
  } else {
    healthCheck = {
      url: text(fields.url, 'url'),
      interval: integer(fields.interval, 'interval'),
      timeout: fields.timeout === undefined ? 5 : integer(fields.timeout, 'timeout'),
    };
    if (tolerance) {
      healthCheck.tolerance = fields.tolerance === undefined ? 0 : integer(fields.tolerance, 'tolerance');
    }
  }

  return { ...resolveMembers(declaration, rules), healthCheck };
}
