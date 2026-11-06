import type { ConfigType } from '@/lib/subconverter/types/configuration';

export const configurationTypes = ['ini', 'yaml', 'toml'] as const satisfies readonly ConfigType[];

export function isConfigurationType(value: unknown): value is ConfigType {
  return value === 'ini' || value === 'yaml' || value === 'toml';
}

export class ConfigurationFieldError extends Error {
  constructor(
    public readonly field: string,
    message: string,
  ) {
    super(`${field}: ${message}`);
    this.name = 'ConfigurationFieldError';
  }
}
