import type { ConfigType } from '../types';

export const CONFIG_TYPES = {
  PROXY_GROUP: 'proxy_group',
  RULESET: 'ruleset',
  CUSTOM: 'custom',
} as const;

export function isConfigType(value: unknown): value is ConfigType {
  return Object.values(CONFIG_TYPES).some((type) => type === value);
}
