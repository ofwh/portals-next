import { isRecord } from '@/lib/shared/data';
import { TEMPLATE_LIMITS } from '../shared';

const { entries: MAX_ENTRIES, depth: MAX_DEPTH } = TEMPLATE_LIMITS;

function validateValue(value: unknown, depth = 0, budget = { count: 0 }, ancestors = new Set<object>()): void {
  if (++budget.count > MAX_ENTRIES || depth > MAX_DEPTH) {
    throw new Error('Template structure exceeds the limit');
  }

  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return;
  }

  if ((!Array.isArray(value) && !isRecord(value)) || ancestors.has(value)) {
    throw new Error('Invalid template value');
  }

  ancestors.add(value);
  for (const child of Object.values(value)) {
    validateValue(child, depth + 1, budget, ancestors);
  }
  ancestors.delete(value);
}

export function validateObject(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error('Template root must be an object');
  }

  validateValue(value);

  return value;
}
