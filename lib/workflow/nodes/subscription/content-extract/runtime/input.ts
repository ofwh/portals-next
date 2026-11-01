import { appError } from '@/lib/api';
import { configSchema } from '../model/schema';

export const parseConfig = (value: unknown) => configSchema.parse(value);

export function parseInput(values: readonly string[]): string {
  if (values.length !== 1) {
    throw appError('workflow.REQUIRED_INPUT');
  }

  return values[0];
}
