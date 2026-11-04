export type ConfigValue = string | null | ConfigObject | ConfigValue[];

export interface ConfigEntry {
  key: string;
  values: ConfigValue[];
}

export interface ConfigObject {
  entries: ConfigEntry[];
  isolated: string[];
}

export type ConfigType = 'ini' | 'yaml' | 'toml';

export interface ConfigParser {
  parse(content: string, type: ConfigType): ConfigObject;
}
