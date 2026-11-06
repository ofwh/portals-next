import logger from '@/lib/api/logger';
import { ConfigurationFieldError } from '@/lib/subconverter/configuration/errors';
import type { ConfigEntry, ConfigObject, ConfigValue } from '@/lib/subconverter/types/configuration';

export { ConfigurationFieldError } from '@/lib/subconverter/configuration/errors';

export function entry(object: ConfigObject, key: string): ConfigEntry | undefined {
  return object.entries.find((item) => item.key === key);
}

export function objectValue(value: ConfigValue, field: string): ConfigObject {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    logger.warn('Expected an object', { field, data: value });

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
    logger.warn('Expected one object', { field: key, data: item.values });

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
    logger.warn('Expected one text value', { field: key, data: item?.values });

    throw new ConfigurationFieldError(key, 'Expected one text value');
  }

  return item.values[0];
}

export function requiredText(object: ConfigObject, key: string): string {
  const value = text(object, key, true);

  if (value === undefined) {
    logger.warn('Required', { field: key, data: value });

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
      logger.warn('Expected text values', { field: key, data: value });

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
    logger.warn('Expected a non-negative safe integer', { field, data: value });

    throw new ConfigurationFieldError(field, 'Expected a non-negative safe integer');
  }

  return Number(value);
}

export function rejectImport(value: ConfigObject | string): void {
  if (typeof value === 'string' ? value.startsWith('!!import:') : entry(value, 'import') !== undefined) {
    logger.warn('Imports must be expanded before parsing', {
      field: 'import',
      data: typeof value === 'string' ? value : entry(value, 'import')?.values,
    });

    throw new ConfigurationFieldError('import', 'Imports must be expanded before parsing');
  }
}

export function validateFields(object: ConfigObject, accepts: (key: string) => boolean): void {
  if (object.isolated.length) {
    throw new ConfigurationFieldError('configuration', 'Unsupported configuration line');
  }

  for (const item of object.entries) {
    if (!accepts(item.key)) {
      throw new ConfigurationFieldError(item.key, 'Unsupported configuration field');
    }
  }
}

export function validateRecipe(configuration: ConfigObject): void {
  const custom = section(configuration, 'custom');

  for (const scope of [configuration, custom]) {
    if (scope?.isolated.length) {
      throw new ConfigurationFieldError('configuration', 'Unsupported configuration line');
    }
  }
}
