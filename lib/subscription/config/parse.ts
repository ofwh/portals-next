import { parseCustom, parseProxyGroup, parseRuleset } from './parsers';
import { CONFIG_TYPES, isConfigType } from '../shared';
import type { ConfigDeclaration } from '../types';

export class ConfigParseError extends SyntaxError {
  constructor(
    message: string,
    public readonly line: number,
  ) {
    super(`Line ${line}: ${message}`);
    this.name = 'ConfigParseError';
  }
}

export function parseConfig(input: string): ConfigDeclaration[] {
  const declarations: ConfigDeclaration[] = [];

  for (const [index, rawLine] of input.split(/\r\n?|\n/).entries()) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#') || line.startsWith(';')) {
      continue;
    }

    try {
      const equals = line.indexOf('=');
      const type = line.slice(0, equals).trim();

      if (equals < 0 || !isConfigType(type)) {
        throw new SyntaxError(`Expected ${Object.values(CONFIG_TYPES).join(', ')} declaration`);
      }

      const body = line.slice(equals + 1);

      switch (type) {
        case CONFIG_TYPES.PROXY_GROUP:
          declarations.push({ type, value: parseProxyGroup(body) });
          break;
        case CONFIG_TYPES.RULESET:
          declarations.push({ type, value: parseRuleset(body) });
          break;
        case CONFIG_TYPES.CUSTOM:
          declarations.push({ type, value: parseCustom(body) });
          break;
      }
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        throw error;
      }

      throw new ConfigParseError(error.message, index + 1);
    }
  }

  return declarations;
}
