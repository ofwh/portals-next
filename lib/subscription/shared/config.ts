import type { ConfigFormat } from '../types/shared';

export const configFormatOptions = ['ini', 'yaml', 'toml'] as const satisfies readonly ConfigFormat[];

export function isConfigFormat(value: unknown): value is ConfigFormat {
  return configFormatOptions.some((format) => format === value);
}
