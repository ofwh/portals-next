import { booleanOption, resolveMembers, text } from './shared';
import type { GroupCategoryResolver } from './types';
import { POLICY_ERROR_CODES } from '../../shared/errors';
import type { GroupHealthCheck } from '../../types/policy';
import { EntryError } from '../diagnostics';

function optionalInteger(value: unknown, field: string): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  const parsed = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;

  if (typeof parsed !== 'number' || !Number.isSafeInteger(parsed) || parsed < 0) {
    throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_OPTIONS, field);
  }

  return parsed;
}

export const singboxUrlTestResolver: GroupCategoryResolver = {
  kind: 'url-test',
  resolve(declaration) {
    const rules = [...declaration.rules];
    let fields = declaration.fields;

    if (declaration.syntax === 'delimited') {
      fields = {};
      const last = rules.at(-1) ?? '';
      const previous = rules.at(-2) ?? '';
      const hasTimes =
        rules.length >= 3 && (previous === '' || /^https?:\/\//i.test(previous) || /^\d*(?:,\d*){1,2}$/.test(last));

      if (hasTimes) {
        const times = rules.pop()!.split(',');

        if (times.length > 3) {
          throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_OPTIONS, 'interval');
        }

        fields = { url: rules.pop(), interval: times[0], timeout: times[1], tolerance: times[2] };
      } else if (/^https?:\/\//i.test(last)) {
        fields.url = rules.pop();
      }
    }

    const healthCheck: GroupHealthCheck = {};

    if (fields.url !== undefined && fields.url !== '') {
      healthCheck.url = text(fields.url, 'url');
    }

    for (const field of ['interval', 'timeout', 'tolerance'] as const) {
      const value = optionalInteger(fields[field], field);

      if (value !== undefined) {
        healthCheck[field] = value;
      }
    }

    const lazy = booleanOption(declaration, 'lazy');
    const evaluateBeforeUse = booleanOption(declaration, 'evaluate-before-use');

    return {
      ...resolveMembers(declaration, rules),
      ...(Object.keys(healthCheck).length ? { healthCheck } : {}),
      ...(lazy !== undefined ? { lazy } : {}),
      ...(evaluateBeforeUse !== undefined ? { evaluateBeforeUse } : {}),
    };
  },
};
