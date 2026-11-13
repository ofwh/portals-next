import { parseDocument, stringify, visit } from 'yaml';
import { isRecord } from '@/lib/shared/data';
import type {
  CompiledNode,
  IniDocument,
  ParsedTemplate,
  Source,
  SubscriptionType,
  TemplateModule,
  TemplateTarget,
} from '../types';

const maxLength = 8 * 1024 * 1024;
const maxEntries = 100_000;
const maxDepth = 64;

type TemplateDefinition = {
  type: TemplateTarget;
  parse: (input: string) => ParsedTemplate;
  render: (template: ParsedTemplate, nodes: readonly CompiledNode[]) => string;
};

export class TemplateError extends Error {
  constructor(
    public readonly target: SubscriptionType,
    public readonly code: 'INVALID_DOCUMENT' | 'INPUT_TOO_LARGE' | 'TEMPLATE_MISMATCH',
  ) {
    super(`Invalid ${target} template: ${code}`);
    this.name = 'TemplateError';
  }
}

function validateValue(value: unknown, depth = 0, budget = { count: 0 }, ancestors = new Set<object>()): void {
  if (++budget.count > maxEntries || depth > maxDepth) {
    throw new Error('Template structure exceeds the limit');
  }

  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return;
  }

  if ((!Array.isArray(value) && !isRecord(value)) || ancestors.has(value)) {
    throw new Error('Invalid template value');
  }

  ancestors.add(value);
  for (const child of Object.values(value)) {
    validateValue(child, depth + 1, budget, ancestors);
  }
  ancestors.delete(value);
}

function serializeTemplate(template: ParsedTemplate): string {
  if (template.format === 'ini') {
    return serializeIni(template.value);
  }

  return template.format === 'yaml' ? stringify(template.value, { lineWidth: 0 }) : JSON.stringify(template.value);
}

export function defineTemplate(definition: TemplateDefinition): TemplateModule {
  const parseTemplate = (input: string): ParsedTemplate => {
    if (input.length > maxLength || input.split(/\r\n|\n|\r/, maxEntries + 1).length > maxEntries) {
      throw new TemplateError(definition.type, 'INPUT_TOO_LARGE');
    }

    try {
      return definition.parse(input.replace(/^\uFEFF/, ''));
    } catch (error) {
      if (error instanceof TemplateError) {
        throw error;
      }

      throw new TemplateError(definition.type, 'INVALID_DOCUMENT');
    }
  };

  return {
    parseTemplate,
    compileTemplate(input, nodes = []) {
      if (
        (typeof input !== 'string' && input.target !== definition.type) ||
        nodes.some((node) => node.target !== definition.type)
      ) {
        throw new TemplateError(definition.type, 'TEMPLATE_MISMATCH');
      }

      try {
        const template = parseTemplate(typeof input === 'string' ? input : serializeTemplate(input));

        if (typeof input !== 'string' && input.format !== template.format) {
          throw new TemplateError(definition.type, 'TEMPLATE_MISMATCH');
        }

        return definition.render(template, nodes);
      } catch (error) {
        if (error instanceof TemplateError) {
          throw error;
        }

        throw new TemplateError(definition.type, 'INVALID_DOCUMENT');
      }
    },
  };
}

export function parseObject(input: string, format: 'yaml' | 'json'): Source {
  let value: unknown;

  if (format === 'yaml') {
    const document = parseDocument(input, { uniqueKeys: true, strict: true });

    if (document.errors.length || document.warnings.length) {
      throw new Error('Invalid YAML template');
    }

    let count = 0;

    visit(document, {
      Node(_key, _node, path) {
        if (++count > maxEntries || path.length > maxDepth) {
          throw new Error('Template structure exceeds the limit');
        }
      },
    });
    value = document.toJS({ maxAliasCount: 100 });
  } else {
    value = JSON.parse(input);
  }

  if (!isRecord(value)) {
    throw new Error('Template root must be an object');
  }

  validateValue(value);

  return value;
}

export function appendCollection(document: Source, key: string, values: readonly Source[]): void {
  const current = Object.hasOwn(document, key) ? document[key] : undefined;

  if (current !== undefined && current !== null && !Array.isArray(current)) {
    throw new Error('Template collection must be an array');
  }

  if (values.length) {
    Object.defineProperty(document, key, {
      value: [...(Array.isArray(current) ? current : []), ...values],
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
}

export function parseIni(input: string): IniDocument {
  const document: IniDocument = { sections: [] };
  let current: IniDocument['sections'][number] | undefined;

  for (const raw of input.split(/\r\n|\n|\r/)) {
    const line = raw.trim();

    if (line.startsWith('[')) {
      const match = /^\[([^\]]+)\]\s*(?:[;#].*)?$/.exec(line);

      if (!match || !match[1].trim()) {
        throw new Error('Invalid template section');
      }

      current = { name: match[1].trim(), header: raw, lines: [] };
      document.sections.push(current);
    } else {
      if (!current) {
        current = { name: null, lines: [] };
        document.sections.push(current);
      }

      current.lines.push(raw);
    }
  }

  return document;
}

export function serializeIni(document: IniDocument): string {
  return document.sections
    .flatMap((section) => [...(section.name === null ? [] : [section.header ?? `[${section.name}]`]), ...section.lines])
    .join('\n');
}

export function iniTemplate(type: TemplateTarget, sectionName = 'Proxy'): TemplateModule {
  return defineTemplate({
    type,
    parse: (input) => ({ target: type, format: 'ini', value: parseIni(input) }),
    render(template, nodes) {
      if (template.format !== 'ini') {
        throw new TemplateError(type, 'TEMPLATE_MISMATCH');
      }

      const document = template.value;
      const append = (name: string, lines: string[]) => {
        if (!lines.length) {
          return;
        }

        let section = document.sections.find((entry) => entry.name?.toLowerCase() === name.toLowerCase());

        if (!section) {
          section = { name, lines: [] };
          document.sections.push(section);
        }

        section.lines.push(...lines);
      };

      append(
        sectionName,
        nodes.map((node) => node.content),
      );
      for (const section of nodes.flatMap((node) => node.sections)) {
        append(
          section.name,
          Object.entries(section.entries).map(([key, value]) => `${key} = ${String(value)}`),
        );
      }

      return serializeIni(document);
    },
  });
}
