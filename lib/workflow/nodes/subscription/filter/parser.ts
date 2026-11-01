import { appError } from '@/lib/api';
import { configSchema } from './schema';
import type { FilterInput, FilterRunInput } from './types';
import { subscriptionNodesSchema } from '../schema';

export const parseConfig = (raw: unknown) => configSchema.parse(raw);

export function parseInput(values: readonly FilterInput[]): FilterRunInput {
  const value = values[0];

  if (!value) {
    throw appError('workflow.REQUIRED_INPUT');
  }

  return subscriptionNodesSchema.parse(value);
}
