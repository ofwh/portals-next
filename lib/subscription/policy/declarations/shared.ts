import { POLICY_ERROR_CODES } from '../../shared/errors';
import { isRecord } from '../../shared/text';
import type { ConfigFormat } from '../../types/shared';
import { EntryError } from '../diagnostics';
import { forbidImport, groupKind, stringList, text } from '../resolvers/shared';
import type { GroupDeclaration } from '../resolvers/types';

function delimitedDeclaration(input: unknown): GroupDeclaration {
  const fields = text(input, 'entry').split('`');

  if (fields.length < 3) {
    throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_ENTRY);
  }

  return {
    name: text(fields[0], 'name'),
    kind: groupKind(fields[1]),
    rules: fields.slice(2),
    providers: [],
    syntax: 'delimited',
    fields: {},
  };
}

function yamlScalar(value: unknown, fallback: string, field: string): string {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value === 'number' && Number.isSafeInteger(value)) {
    return String(value);
  }

  if (typeof value === 'string') {
    return value;
  }

  throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_OPTIONS, field);
}

export function readGroupDeclaration(input: unknown, format: ConfigFormat): GroupDeclaration {
  forbidImport(input);
  if (format === 'ini') {
    return delimitedDeclaration(input);
  }

  if (!isRecord(input)) {
    throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_ENTRY);
  }

  const name = text(input.name, 'name');
  const kind = groupKind(input.type);
  const rules = stringList(input.rule, 'rule');

  if (format === 'yaml') {
    if (rules.length < (kind === 'ssid' ? 2 : 1)) {
      throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_ENTRY, 'rule');
    }

    // YAML 兼容旧绑定，relay 的探测尾部保留为成员声明。
    if (kind !== 'select' && kind !== 'ssid') {
      rules.push(
        yamlScalar(input.url, 'https://www.gstatic.com/generate_204', 'url'),
        [
          yamlScalar(input.interval, '300', 'interval'),
          yamlScalar(input.timeout, '', 'timeout'),
          yamlScalar(input.tolerance, '', 'tolerance'),
        ].join(','),
      );
    }

    return delimitedDeclaration([name, kind, ...rules].join('`'));
  }

  return { name, kind, rules, providers: stringList(input.use, 'use'), syntax: 'object', fields: input };
}
