import { POLICY_ERROR_CODES } from '../../shared/errors';
import { isRecord } from '../../shared/text';
import type { ProxyGroupKind } from '../../types/policy';
import type { ConfigFormat } from '../../types/shared';
import { EntryError } from '../diagnostics';
import { forbidImport, groupKind, stringList, text } from '../resolvers/shared';
import type { GroupDeclaration } from '../resolvers/types';

function kind(value: unknown): ProxyGroupKind {
  return groupKind(value === 'selector' ? 'select' : value === 'urltest' ? 'url-test' : value);
}

export function readSingboxGroupDeclaration(input: unknown, format: ConfigFormat): GroupDeclaration {
  forbidImport(input);

  if (format === 'ini') {
    const parts = text(input, 'entry').split('`');

    if (parts.length < 3) {
      throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_ENTRY);
    }

    const fields: Record<string, unknown> = {};
    const rules = parts.slice(2);
    const last = rules.at(-1);

    if (parts[1] === 'selector' && (last === 'true' || last === 'false')) {
      fields.interrupt_exist_connections = rules.pop() === 'true';
    }

    return { name: text(parts[0], 'name'), kind: kind(parts[1]), rules, providers: [], syntax: 'delimited', fields };
  }

  if (!isRecord(input)) {
    throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_ENTRY);
  }

  return {
    name: text(input.name, 'name'),
    kind: kind(input.type),
    rules: stringList(input.rule, 'rule'),
    providers: format === 'toml' ? stringList(input.use, 'use') : [],
    syntax: 'object',
    fields: input,
  };
}
