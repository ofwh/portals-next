import { appError } from '@/lib/api';
import { assertJson, isRecord } from '@/lib/shared/data';
import type { ValueSchema, WorkflowArray, WorkflowDataTypes, WorkflowObject } from '../types';

export const unknownValue: ValueSchema<WorkflowDataTypes['any']> = {
  descriptor: { kind: 'any' },
  parse(value) {
    assertJson(value);

    return value;
  },
};
export const stringValue: ValueSchema<WorkflowDataTypes['String']> = {
  descriptor: { kind: 'string' },
  parse(value) {
    if (typeof value !== 'string') {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};
export const numberValue: ValueSchema<WorkflowDataTypes['Number']> = {
  descriptor: { kind: 'number' },
  parse(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};
export const booleanValue: ValueSchema<WorkflowDataTypes['Boolean']> = {
  descriptor: { kind: 'boolean' },
  parse(value) {
    if (typeof value !== 'boolean') {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};
export const nullValue: ValueSchema<WorkflowDataTypes['null']> = {
  descriptor: { kind: 'null' },
  parse(value) {
    if (value !== null) {
      throw appError('common.INVALID_PARAMS');
    }

    return null;
  },
};

export function arrayOf<T>(item: ValueSchema<T>): ValueSchema<WorkflowArray<T>> {
  return {
    descriptor: { kind: 'array', items: item.descriptor },
    parse(value) {
      assertJson(value);
      if (!Array.isArray(value)) {
        throw appError('common.INVALID_PARAMS');
      }

      return value.map((entry) => item.parse(entry));
    },
  };
}

export function recordOf<T>(schema: ValueSchema<T>): ValueSchema<WorkflowObject<T>> {
  return {
    descriptor: { kind: 'record', values: schema.descriptor },
    parse(value) {
      assertJson(value);
      if (!isRecord(value)) {
        throw appError('common.INVALID_PARAMS');
      }

      return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, schema.parse(entry)]));
    },
  };
}

export function unionOf<A, B>(a: ValueSchema<A>, b: ValueSchema<B>): ValueSchema<A | B> {
  return {
    descriptor: { kind: 'union', types: [a.descriptor, b.descriptor] },
    parse(value) {
      assertJson(value);
      try {
        return a.parse(value);
      } catch {
        return b.parse(value);
      }
    },
  };
}
