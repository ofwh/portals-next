import { debugNode } from '../../proxy-node/debug';
import type { IniConfig, IniProxyNode, IniProxyOptions, IniSection } from '../../types/providers/ini';
import { camelCase } from '../schema';

export function splitFields(line: string): string[] {
  const fields: string[] = [];
  let quote = '';
  let depth = 0;
  let start = 0;
  let escaped = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (quote) {
      if (char === quote) {
        quote = '';
      }

      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '(' || char === '{' || char === '[') {
      depth++;
    } else if (char === ')' || char === '}' || char === ']') {
      depth--;
    } else if (char === ',' && depth === 0) {
      fields.push(line.slice(start, i).trim());
      start = i + 1;
    }

    if (depth < 0) {
      throw new Error('Invalid proxy fields');
    }
  }
  if (quote || depth !== 0) {
    throw new Error('Unterminated proxy field');
  }

  fields.push(line.slice(start).trim());

  return fields;
}

function unquote(value: string): string {
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function assignment(line: string): number {
  let quote = '';
  let escaped = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (escaped) {
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (quote) {
      if (char === quote) {
        quote = '';
      }
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '=') {
      return i;
    }
  }

  return -1;
}

export function parseIni(content: string, quantumultX = false): IniConfig {
  const sections: IniSection[] = [];
  const proxies: IniProxyNode[] = [];
  let section = 'Proxy';

  for (const [index, source] of content
    .replace(/^\uFEFF/, '')
    .split(/\r\n|\n|\r/)
    .entries()) {
    const line = source.trim();

    if (!line || line.startsWith('#') || line.startsWith(';') || line.startsWith('//')) {
      continue;
    }

    const heading = /^\[([^\]]+)\]\s*(?:[#;].*)?$/.exec(line);

    if (heading) {
      section = heading[1];
      if (!sections.some((item) => item.name === section)) {
        sections.push({ name: section, lines: [] });
      }

      continue;
    }

    let current = sections.find((item) => item.name === section);

    if (!current) {
      current = { name: section, lines: [] };
      sections.push(current);
    }

    current.lines.push(line);
    if (section.toLowerCase() !== 'proxy' && section.toLowerCase() !== 'server_local') {
      continue;
    }

    try {
      const equals = assignment(line);

      if (equals < 1) {
        throw new Error('Invalid INI proxy declaration');
      }

      const left = unquote(line.slice(0, equals).trim());
      const fields = splitFields(line.slice(equals + 1));
      const options: IniProxyOptions = {};
      const args: string[] = [];

      for (const field of fields.slice(1)) {
        const separator = assignment(field);

        if (separator > 0) {
          Object.defineProperty(options, camelCase(field.slice(0, separator).trim()), {
            value: unquote(field.slice(separator + 1).trim()),
            enumerable: true,
            configurable: true,
            writable: true,
          });
        } else {
          args.push(unquote(field));
        }
      }
      if (quantumultX || section.toLowerCase() === 'server_local' || /^\[?[^,]+\]?:\d+$/.test(fields[0])) {
        proxies.push({
          name: options.tag ?? '',
          type: left.toLowerCase(),
          arguments: [unquote(fields[0]), ...args],
          options,
          raw: line,
          layout: 'endpoint',
        });
      } else {
        proxies.push({
          name: left,
          type: fields[0].toLowerCase(),
          arguments: args,
          options,
          raw: line,
          layout: args.length > 2 ? 'positional' : 'named',
        });
      }
    } catch {
      debugNode('ini', 'parse', index, 'invalid-node-data');
    }
  }
  if (!sections.some((item) => ['proxy', 'server_local'].includes(item.name.toLowerCase()))) {
    throw new Error('INI configuration requires a proxy section');
  }

  return { sections, proxies };
}

export function parse(content: string): IniConfig {
  return parseIni(content);
}
