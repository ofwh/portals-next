import { parseEntry, parseString, splitFields } from './shared';
import type { BaseRuleset } from '../../types';

export function parseRuleset(input: string): BaseRuleset {
  const fields = splitFields(input, ',');
  const entry = parseEntry(fields[0], fields.slice(2));
  const kind = parseString(fields[1] ?? '');

  if (!kind) {
    throw new SyntaxError('Kind and proxy group name are required');
  }

  return { ...entry, kind };
}
