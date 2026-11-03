import { parse, ParsingError } from 'js-ini';
import { ConfigSyntaxError } from '../errors';
import { createObject, entryFor } from '../model';
import type { ConfigObject } from '../types';

function decode(value: string, line: number, column: number): string {
  const quote = value[0];

  if (quote !== '"' && quote !== "'") {
    return value;
  }

  let result = '';
  const escapes: Record<string, string> = { n: '\n', r: '\r', t: '\t', '\\': '\\', '"': '"', "'": "'" };

  for (let index = 1; index < value.length; index++) {
    const char = value[index];

    if (char === quote) {
      if (index !== value.length - 1) {
        throw new ConfigSyntaxError('ini', line, column + index + 1, 'Unexpected content after quoted value');
      }

      return result;
    }

    if (char === '\\' && index + 1 < value.length) {
      const next = value[++index];

      result += escapes[next] ?? `\\${next}`;
    } else {
      result += char;
    }
  }

  throw new ConfigSyntaxError('ini', line, column, 'Unterminated quoted value');
}

export function parseIni(content: string): ConfigObject {
  const root = createObject();
  const sections = new Map<string, ConfigObject>();
  let current = root;

  for (const [index, source] of content
    .replace(/^\uFEFF/, '')
    .split(/\r\n|\n|\r/)
    .entries()) {
    const line = source.trim();
    const column = source.indexOf(line) + 1;

    if (!line || /^(?:#|;|\/\/)/.test(line)) {
      continue;
    }

    if (line.startsWith('[')) {
      const section = /^\[([^\]]+)\]\s*(?:(?:#|;|\/\/).*)?$/.exec(line);
      const name = section?.[1].trim();

      if (!name) {
        throw new ConfigSyntaxError('ini', index + 1, column, 'Invalid section header');
      }

      const existing = sections.get(name);

      if (existing) {
        current = existing;
      } else {
        current = createObject();
        sections.set(name, current);
        entryFor(root, name).values.push(current);
      }

      continue;
    }

    try {
      parse(line, {
        delimiter: '=',
        comment: ['#', ';', '//'],
        autoTyping(value: string, _section: string | symbol, key: string) {
          if (!key) {
            throw new ConfigSyntaxError('ini', index + 1, column, 'Assignment requires a key');
          }

          const valueColumn = column + line.indexOf('=') + 1 + line.slice(line.indexOf('=') + 1).indexOf(value);

          entryFor(current, key).values.push(decode(value, index + 1, valueColumn));

          return value;
        },
        // 直接写入有序模型，避免中间对象改写特殊键。
        keyMergeStrategy: () => undefined,
      });
    } catch (error) {
      if (error instanceof ParsingError) {
        current.isolated.push(line);
      } else {
        throw error;
      }
    }
  }

  return root;
}
