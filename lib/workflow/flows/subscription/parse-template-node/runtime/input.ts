import { appError } from '@/lib/api';
import { configSchema, inputSchema } from '../model/schema';
import type { ParseTemplateInput } from '../model/types';

export const parseConfig = (raw: unknown) => configSchema.parse(raw);

export function parseInput(values: readonly ParseTemplateInput[]): string {
  const value = values[0];

  if (value === undefined) {
    throw appError('workflow.REQUIRED_INPUT');
  }

  return inputSchema.parse(value);
}
