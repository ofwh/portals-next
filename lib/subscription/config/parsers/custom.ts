import { parseParameters, parseString, splitFields } from './shared';
import type { BaseCustomConfig } from '../../types';

export function parseCustom(input: string): BaseCustomConfig {
  const fields = splitFields(input, ',');
  const kind = parseString(fields[0]);

  if (!kind) {
    throw new SyntaxError('Custom kind is required');
  }

  return { kind, parameters: parseParameters(fields.slice(1)) };
}
