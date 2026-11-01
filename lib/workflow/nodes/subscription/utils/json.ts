import { appError } from '@/lib/api';
import { isRecord } from '../../../utils';
import type { Json } from '../types';

const forbidden = new Set(['__proto__', 'constructor', 'prototype']);

export function sanitizeJson(value: unknown, depth = 0): Json | undefined {
  if (depth > 12) {
    throw appError('common.INVALID_PARAMS');
  }

  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeJson(item, depth + 1) ?? null);
  }

  if (!isRecord(value)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !forbidden.has(key))
      .map(([key, item]) => [key, sanitizeJson(item, depth + 1)])
      .filter(([, item]) => item !== undefined),
  ) as Record<string, Json>;
}
