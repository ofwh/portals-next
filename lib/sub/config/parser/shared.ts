import type { BaseCustomConfig, ConfigParameter } from '../../types';

export function splitFields(input: string, separator: string, limit = Infinity): string[] {
  const fields: string[] = [];
  const brackets: string[] = [];
  let quote = '';
  let escaped = false;
  let start = 0;

  for (let index = 0; index < input.length; index++) {
    const character = input[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === quote) {
        quote = '';
      }

      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '[' || character === '{' || character === '(') {
      brackets.push(character === '[' ? ']' : character === '{' ? '}' : ')');
    } else if (character === ']' || character === '}' || character === ')') {
      if (brackets.pop() !== character) {
        throw new SyntaxError('Mismatched brackets');
      }
    } else if (character === separator && brackets.length === 0 && fields.length < limit - 1) {
      fields.push(input.slice(start, index).trim());
      start = index + 1;
    }
  }

  if (quote || brackets.length) {
    throw new SyntaxError('Unterminated quote or brackets');
  }

  fields.push(input.slice(start).trim());

  return fields;
}

export function parseString(input: string): string {
  if (input.startsWith('"')) {
    const value: unknown = JSON.parse(input);

    if (typeof value !== 'string') {
      throw new SyntaxError('Expected a string');
    }

    return value;
  }

  if (input.startsWith("'")) {
    if (!input.endsWith("'")) {
      throw new SyntaxError('Unterminated string');
    }

    return input.slice(1, -1).replace(/\\(['\\])/g, '$1');
  }

  return input;
}

function parseValue(input: string): unknown {
  if (input.startsWith("'")) {
    return parseString(input);
  }

  if (/^(?:["\[{]|true$|false$|null$|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$)/.test(input)) {
    const value: unknown = JSON.parse(input);

    return value;
  }

  return input;
}

export function parseEntry(name: string, fields: string[], namedOnly = false): BaseCustomConfig {
  const parameters: ConfigParameter[] = [];

  for (const field of fields) {
    const parts = splitFields(field, '=', 2);

    if (parts.length === 1) {
      if (namedOnly || !field) {
        throw new SyntaxError('Expected a named parameter or nonempty positional value');
      }

      parameters.push({ type: 'positional', value: parseString(field) });
      continue;
    }

    const name = parseString(parts[0]);
    const value = parseValue(parts[1]);

    if (!name) {
      throw new SyntaxError('Parameter name is required');
    }

    parameters.push({ type: 'named', name, value });
  }

  return {
    name: parseString(name),
    parameters,
  };
}
