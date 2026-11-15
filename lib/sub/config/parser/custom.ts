import { parseEntry, splitFields } from './shared';
import type { BaseCustomConfig } from '../../types';

export function parseCustom(input: string): BaseCustomConfig {
  const fields = splitFields(input, ',');

  return parseEntry(fields[0], fields.slice(1), true);
}
