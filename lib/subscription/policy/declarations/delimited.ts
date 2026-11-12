import { assertJson } from '@/lib/shared/data';
import { POLICY_ERROR_CODES } from '../../shared/errors';
import { isRecord } from '../../shared/text';
import type { ProxyGroup } from '../../types/policy';
import { EntryError } from '../diagnostics';

export function splitGroupDeclaration(input: string): { parts: string[]; flags?: ProxyGroup['flags'] } {
  const parts: string[] = [];
  let start = 0;

  for (let index = 0; index < input.length; index++) {
    if (input[index] !== '`') {
      continue;
    }

    parts.push(input.slice(start, index));
    start = index + 1;

    if (parts.length < 2 || !input.slice(start).trimStart().startsWith('{')) {
      continue;
    }

    try {
      const flags: unknown = JSON.parse(input.slice(start));

      if (!isRecord(flags)) {
        throw new Error('Invalid flags');
      }

      assertJson(flags);

      return { parts, flags };
    } catch {
      throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_OPTIONS, 'flags');
    }
  }

  parts.push(input.slice(start));

  return { parts };
}
