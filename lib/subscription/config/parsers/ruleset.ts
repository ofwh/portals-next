import { parseParameters, parseString, splitFields } from './shared';
import type { BaseRuleset } from '../../types';

export function parseRuleset(input: string): BaseRuleset {
  const fields = splitFields(input, ',');
  const name = parseString(fields[0]);
  const kind = parseString(fields[1] ?? '');

  if (!kind) {
    throw new SyntaxError('Ruleset kind is required');
  }

  return { name, kind, parameters: parseParameters(fields.slice(2)) };
}
