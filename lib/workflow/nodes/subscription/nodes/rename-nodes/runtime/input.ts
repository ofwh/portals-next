import { appError } from '@/lib/api';
import { configSchema } from '../model/schema';
import type { RenameInput, RenameRunInput } from '../model/types';

export const parseConfig = (raw: unknown) => configSchema.parse(raw);

export function parseInput(values: readonly RenameInput[]): RenameRunInput {
  const value = values[0];

  if (value === undefined) {
    throw appError('workflow.REQUIRED_INPUT');
  }

  return value;
}
