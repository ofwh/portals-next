import { POLICY_ERROR_CODES } from '../../shared/errors';
import { textLimits } from '../../shared/text';
import type { MemberSelector } from '../../types/policy';
import { EntryError } from '../diagnostics';

const sourceKinds = {
  GROUP: 'group',
  GROUPID: 'group-id',
  INSERT: 'insert',
  TYPE: 'type',
  PORT: 'port',
  SERVER: 'server',
} as const;

export function parseSelector(input: string): MemberSelector {
  if (input.length > textLimits.line) {
    throw new EntryError(POLICY_ERROR_CODES.INPUT_TOO_LARGE, 'rule');
  }

  if (!input) {
    throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_SELECTOR, 'rule');
  }

  if (input.startsWith('!!import:')) {
    throw new EntryError(POLICY_ERROR_CODES.POLICY_IMPORT_FORBIDDEN, 'rule');
  }

  if (input.startsWith('[]')) {
    if (!input.slice(2)) {
      throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_SELECTOR, 'rule');
    }

    return { kind: 'reference', name: input.slice(2) };
  }

  if (input.startsWith('script:')) {
    if (!input.slice(7)) {
      throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_SELECTOR, 'rule');
    }

    return { kind: 'script', source: input.slice(7) };
  }

  const match = /^!!(GROUP|GROUPID|INSERT|TYPE|PORT|SERVER)=(.+?)(?:!!(.*))?$/.exec(input);

  if (match) {
    const kind = sourceKinds[match[1] as keyof typeof sourceKinds];

    if ((kind === 'group-id' || kind === 'insert' || kind === 'port') && !/^[\d+!,\-]+$/.test(match[2])) {
      throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_SELECTOR, 'rule');
    }

    return { kind, target: match[2], ...(match[3] !== undefined ? { pattern: match[3] } : {}) };
  }

  if (input.startsWith('!!')) {
    throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_SELECTOR, 'rule');
  }

  return { kind: 'name', pattern: input };
}

export function parseMembers(rules: string[], providers: string[] = []) {
  const selectors: MemberSelector[] = [];
  const providerRefs = [...providers];

  for (const rule of rules) {
    if (rule.startsWith('!!PROVIDER=')) {
      const refs = rule
        .slice(11)
        .split(',')
        .map((value) => value.trim());

      if (refs.some((value) => !value)) {
        throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_SELECTOR, 'rule');
      }

      providerRefs.push(...refs);
    } else {
      selectors.push(parseSelector(rule));
    }
  }

  return { selectors, providerRefs };
}
