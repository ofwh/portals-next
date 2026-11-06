import logger from '@/lib/api/logger';
import { parseIni, parseToml, parseYaml } from './drivers';
import { ConfigParameterError } from './errors';
import type { ConfigObject, ConfigParser, ConfigType } from '../types/configuration';

export type * from '../types/configuration';
export { ConfigParameterError, ConfigSyntaxError } from './errors';

export function parse(content: string, type: ConfigType): ConfigObject {
  if (typeof content !== 'string') {
    logger.warn('Configuration content must be a string', { data: content });

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
      logger.warn('Configuration type must be ini, yaml or toml', { data: type });

      throw new ConfigParameterError('Configuration type must be ini, yaml or toml');
  }
}

export const parser: ConfigParser = { parse };
