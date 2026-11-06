import type { ConfigType } from '@/lib/subconverter/types/configuration';

export const configurationTypes = ['ini', 'yaml', 'toml'] as const satisfies readonly ConfigType[];

export function isConfigurationType(value: unknown): value is ConfigType {
  return value === 'ini' || value === 'yaml' || value === 'toml';
}

export const configurationClients = ['clash', 'clashr', 'surge', 'quanx', 'loon', 'surfboard', 'stash'] as const;
export type ConfigurationClient = (typeof configurationClients)[number];

export function isConfigurationClient(value: unknown): value is ConfigurationClient {
  return configurationClients.some((client) => client === value);
}
