import 'server-only';
import { parseDocument } from 'yaml';
import logger from '@/lib/api/logger';
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
        logger.warn('Duplicate INI section', { data: source });

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

      logger.warn('INI content requires a section', { data: source });

      throw new Error('INI content requires a section');
    }

    current.lines.push(source);
  }

  if (!sections.length) {
    logger.warn('INI content requires a section', { data: content.trim() });

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
        for (const issue of [...yaml.errors, ...yaml.warnings]) {
          const line = source.slice(0, issue.pos[0]).split(/\r\n|\n|\r/).length;

          logger.warn(issue.message, { data: source.split(/\r\n|\n|\r/)[line - 1], line });
        }

        throw new Error('Invalid YAML template');
      }

      document = parseObject(yaml.toJS({ maxAliasCount: 100 }));
      break;
    }
    case 'sssub':
    case 'singbox': {
      let parsed: unknown;

      try {
        parsed = JSON.parse(source || (format === 'sssub' ? '{}' : source));
      } catch (error) {
        logger.warn(error instanceof Error ? error.message : 'Invalid JSON template', { data: source });

        throw error;
      }

      document = parseObject(parsed);
      break;
    }
    default:
      document = parseIni(source);
  }

  return parseTemplate({ format, document }, format);
}

const templates = { parse };

export default templates;
