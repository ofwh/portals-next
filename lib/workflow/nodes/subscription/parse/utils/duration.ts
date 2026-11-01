import { appError } from '@/lib/api';

export function durationSeconds(value: unknown): number {
  if (typeof value !== 'string') {
    throw appError('common.INVALID_PARAMS');
  }

  const match = /^(\d+(?:\.\d+)?)(ms|s|m|h)$/.exec(value);

  if (!match) {
    throw appError('common.INVALID_PARAMS');
  }

  const result = Number(match[1]) * ({ ms: 0.001, s: 1, m: 60, h: 3600 }[match[2]] ?? 0);

  if (!Number.isSafeInteger(result)) {
    throw appError('common.INVALID_PARAMS');
  }

  return result;
}
