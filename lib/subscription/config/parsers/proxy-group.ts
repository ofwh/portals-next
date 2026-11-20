import { parseParameters, parseString, splitFields } from './shared';
import type { BaseProxyGroup } from '../../types';

export function parseProxyGroup(input: string): BaseProxyGroup {
  const fields = splitFields(input, '`');
  const name = parseString(fields[0]);
  const kind = parseString(fields[1] ?? '');

  if (!kind || !name) {
    throw new SyntaxError('Kind and proxy group name are required');
  }

  return { name, kind, parameters: parseParameters(fields.slice(2)) };
}
