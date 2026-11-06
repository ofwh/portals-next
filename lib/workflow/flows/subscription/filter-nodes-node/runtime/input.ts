import { appError } from '@/lib/api';
import { configSchema } from '../model/schema';
import type { FilterInput, FilterRunInput } from '../model/types';

export const parseConfig = (raw: unknown) => configSchema.parse(raw);

export function parseInput(values: readonly FilterInput[]): FilterRunInput {
  const value = values[0];

  if (value === undefined) {
    throw appError('workflow.REQUIRED_INPUT');
  }

  return value;
}
