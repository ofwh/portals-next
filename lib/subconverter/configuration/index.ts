import { parseIni, parseToml, parseYaml } from './drivers';
import { ConfigParameterError } from './errors';
import type { ConfigObject, ConfigParser, ConfigType } from './types';

export type * from './types';
export { ConfigParameterError, ConfigSyntaxError } from './errors';

export function parse(content: string, type: ConfigType): ConfigObject {
  if (typeof content !== 'string') {
    throw new ConfigParameterError('Configuration content must be a string');
  }

  switch (type) {
    case 'ini':
      return parseIni(content);
    case 'yaml':
      return parseYaml(content);
    case 'toml':
      return parseToml(content);
    default:
      throw new ConfigParameterError('Configuration type must be ini, yaml or toml');
  }
}

export const parser: ConfigParser = { parse };
