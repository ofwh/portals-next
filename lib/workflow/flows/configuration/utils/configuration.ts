import type { ConfigEntry, ConfigObject, ConfigType, ConfigValue } from '@/lib/subconverter/types/configuration';

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

export function entry(object: ConfigObject, key: string): ConfigEntry | undefined {
  return object.entries.find((item) => item.key === key);
}

export function objectValue(value: ConfigValue, field: string): ConfigObject {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new ConfigurationFieldError(field, 'Expected an object');
  }

  return value;
}

export function section(object: ConfigObject, key: string): ConfigObject | undefined {
  const item = entry(object, key);

  if (!item) {
    return undefined;
  }

  if (item.values.length !== 1) {
    throw new ConfigurationFieldError(key, 'Expected one object');
  }

  return objectValue(item.values[0], key);
}

export function text(object: ConfigObject, key: string, required = false): string | undefined {
  const item = entry(object, key);

  if (!item && !required) {
    return undefined;
  }

  if (!item || item.values.length !== 1 || typeof item.values[0] !== 'string') {
    throw new ConfigurationFieldError(key, 'Expected one text value');
  }

  return item.values[0];
}

export function requiredText(object: ConfigObject, key: string): string {
  const value = text(object, key, true);

  if (value === undefined) {
    throw new ConfigurationFieldError(key, 'Required');
  }

  return value;
}

export function texts(object: ConfigObject, key: string): string[] | undefined {
  const item = entry(object, key);

  if (!item) {
    return undefined;
  }

  return item.values.map((value) => {
    if (typeof value !== 'string') {
      throw new ConfigurationFieldError(key, 'Expected text values');
    }

    return value;
  });
}

export function integer(value: string | undefined, field: string, fallback = 0): number {
  if (value === undefined) {
    return fallback;
  }

  if (!/^\+?\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
    throw new ConfigurationFieldError(field, 'Expected a non-negative safe integer');
  }

  return Number(value);
}

export function rejectImport(value: ConfigObject | string): void {
  if (typeof value === 'string' ? value.startsWith('!!import:') : entry(value, 'import') !== undefined) {
    throw new ConfigurationFieldError('import', 'Imports must be expanded before parsing');
  }
}
