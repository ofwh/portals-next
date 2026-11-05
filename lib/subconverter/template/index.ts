import 'server-only';
import { parseDocument } from 'yaml';
import { parseObject, parseTemplate } from './schema';
import type { IniSection } from '../types/providers/ini';
import type { IniTemplateDocument, SubscriptionTemplate, SubscriptionTemplateFormat } from '../types/template';

function parseIni(content: string): IniTemplateDocument {
  const sections: IniSection[] = [];
  let current: IniSection | undefined;

  for (const source of content.split(/\r\n|\n|\r/)) {
    const line = source.trim();
    const heading = /^\[([^\]]+)\]$/.exec(line);

    if (heading) {
      if (sections.some((section) => section.name === heading[1])) {
        throw new Error('Duplicate INI section');
      }

      current = { name: heading[1], lines: [] };
      sections.push(current);
      continue;
    }

    if (!current) {
      if (!line || /^(#|;|\/\/)/.test(line)) {
        continue;
      }

      throw new Error('INI content requires a section');
    }

    current.lines.push(source);
  }

  if (!sections.length) {
    throw new Error('INI content requires a section');
  }

  return { sections };
}

export function parse<T extends SubscriptionTemplateFormat>(content: string, format: T): SubscriptionTemplate<T> {
  const source = content.replace(/^\uFEFF/, '').trim();
  let document: unknown;

  switch (format) {
    case 'clash':
    case 'stash': {
      const yaml = parseDocument(source, { merge: true, uniqueKeys: true });

      if (yaml.errors.length || yaml.warnings.length) {
        throw new Error('Invalid YAML template');
      }

      document = parseObject(yaml.toJS({ maxAliasCount: 100 }));
      break;
    }
    case 'sssub':
    case 'singbox':
      document = parseObject(JSON.parse(source || (format === 'sssub' ? '{}' : source)));
      break;
    default:
      document = parseIni(source);
  }

  return parseTemplate({ format, document }, format);
}

const templates = { parse };

export default templates;
