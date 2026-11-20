import { appError } from '@/lib/api';
import { configSchema } from '../model/schema';

export const parseConfig = (raw: unknown) => configSchema.parse(raw);

export function parseInput(values: readonly string[]): string {
  const input = values[0];

  if (input === undefined) {
    throw appError('workflow.REQUIRED_INPUT');
  }

  return input;
}
