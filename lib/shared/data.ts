import { appError } from '@/lib/api';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
  );
}

export function assertJson(value: unknown, ancestors = new Set<object>()): void {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return;
  }

  if ((!Array.isArray(value) && !isRecord(value)) || ancestors.has(value)) {
    throw appError('common.INVALID_PARAMS');
  }

  ancestors.add(value);
  if (Reflect.ownKeys(value).some((key) => typeof key === 'symbol')) {
    throw appError('common.INVALID_PARAMS');
  }

  if (Array.isArray(value)) {
    if (Object.keys(value).length !== value.length) {
      throw appError('common.INVALID_PARAMS');
    }

    for (let i = 0; i < value.length; i++) {
      assertJson(value[i], ancestors);
    }
  } else {
    for (const key of Object.keys(value)) {
      const property = Object.getOwnPropertyDescriptor(value, key);

      if (!property || !('value' in property)) {
        throw appError('common.INVALID_PARAMS');
      }

      assertJson(property.value, ancestors);
    }
  }

  ancestors.delete(value);
}

export function cloneJson<T>(value: T): T {
  assertJson(value);

  return JSON.parse(JSON.stringify(value)) as T;
}

export function freezeDeep<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) {
      freezeDeep(child);
    }
    Object.freeze(value);
  }

  return value;
}

export function nonempty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function positiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}
