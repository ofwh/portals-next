import { appError } from '@/lib/api';
import { configSchema } from './schema';
import type { ParseInput } from './types';

export const parseConfig = (raw: unknown) => configSchema.parse(raw);

export function parseInput(values: readonly ParseInput[]): string {
  const value = values[0];

  if (value === undefined) {
    throw appError('workflow.REQUIRED_INPUT');
  }

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value.header) && Object.hasOwn(value, 'body')) {
    return typeof value.body === 'string' ? value.body : JSON.stringify(value.body);
  }

  return JSON.stringify(value);
}
