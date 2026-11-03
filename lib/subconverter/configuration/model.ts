import type { ConfigEntry, ConfigObject, ConfigValue } from './types';

export function createObject(): ConfigObject {
  return { entries: [], isolated: [] };
}

export function entryFor(object: ConfigObject, key: string): ConfigEntry {
  const existing = object.entries.find((entry) => entry.key === key);

  if (existing) {
    return existing;
  }

  const entry: ConfigEntry = { key, values: [] };

  object.entries.push(entry);

  return entry;
}

export function valuesOf(value: ConfigValue): ConfigValue[] {
  return Array.isArray(value) ? value : [value];
}

export function isObject(value: ConfigValue | undefined): value is ConfigObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
