import type { OutputFormat } from './types';

export function isOutputFormat(value: unknown): value is OutputFormat {
  return value === 'TEXT' || value === 'JSON';
}
