import { parseEntry, parseString, splitFields } from './shared';
import type { BaseProxyGroup } from '../../types';

export function parseProxyGroup(input: string): BaseProxyGroup {
  const fields = splitFields(input, '`');
  const entry = parseEntry(fields[0], fields.slice(2));
  const kind = parseString(fields[1] ?? '');

  if (!kind || !entry.name) {
    throw new SyntaxError('Kind and proxy group name are required');
  }

  return { ...entry, kind };
}
