import { appError } from '@/lib/api';
import { validPathname, validUrl } from '@/lib/routes/validation';

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw appError('common.INVALID_PARAMS');
  }

  return value as Record<string, unknown>;
}

export function string(value: unknown, allowEmpty = false): string {
  if (typeof value !== 'string' || (!allowEmpty && !value.trim())) {
    throw appError('common.INVALID_PARAMS');
  }

  return value;
}

export function nullableString(value: unknown): string | null {
  return value === null || value === undefined ? null : string(value, true);
}

export function boolean(value: unknown, fallback = true): boolean {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== 'boolean') {
    throw appError('common.INVALID_PARAMS');
  }

  return value;
}

export function choice<const T extends string | number>(value: unknown, choices: readonly T[]): T {
  const result = choices.find((item) => item === value);

  if (result === undefined) {
    throw appError('common.INVALID_PARAMS');
  }

  return result;
}

export function date(value: unknown): Date | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (!(value instanceof Date) && typeof value !== 'string' && typeof value !== 'number') {
    throw appError('common.INVALID_PARAMS');
  }

  const result = value instanceof Date ? value : new Date(value);

  if (!Number.isFinite(result.getTime())) {
    throw appError('common.INVALID_PARAMS');
  }

  return result;
}

export function pathname(value: unknown): string {
  const result = string(value).trim();

  if (!validPathname(result)) {
    throw appError('common.INVALID_PARAMS');
  }

  return result;
}

export function url(value: unknown): string {
  const result = string(value);

  if (!validUrl(result)) {
    throw appError('common.INVALID_PARAMS');
  }

  return result;
}

export function positiveInteger(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) {
    throw appError('common.INVALID_PARAMS');
  }

  return value;
}

export function pagination(params: Record<string, unknown>) {
  const page = positiveInteger(params.page === undefined ? 1 : params.page);
  const size = positiveInteger(params.size === undefined ? 10 : params.size);

  if (size > 100 || !Number.isSafeInteger(page * size)) {
    throw appError('common.INVALID_PARAMS');
  }

  return { page, size };
}
