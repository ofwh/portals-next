import { stringify } from 'yaml';
import { mergeConfig } from './config';
import { parseIni, serializeIni, TEMPLATE_LIMITS } from '../../template';
import type {
  CompiledConfig,
  CompiledNode,
  ParsedTemplate,
  Source,
  SubscriptionType,
  TemplateModule,
  TemplateTarget,
} from '../types';

export { parseIni, parseJson, parseYaml, serializeIni } from '../../template';

const { length: MAX_LENGTH, entries: MAX_ENTRIES } = TEMPLATE_LIMITS;

type TemplateDefinition = {
  type: TemplateTarget;
  parse: (input: string) => ParsedTemplate;
  render: (template: ParsedTemplate, nodes: readonly CompiledNode[]) => string;
  merge?: (template: ParsedTemplate, config: CompiledConfig) => void;
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

function serializeTemplate(template: ParsedTemplate): string {
  if (template.format === 'ini') {
    return serializeIni(template.value);
  }

  return template.format === 'yaml' ? stringify(template.value, { lineWidth: 0 }) : JSON.stringify(template.value);
}

export function defineTemplate(definition: TemplateDefinition): TemplateModule {
  const parseTemplate = (input: string): ParsedTemplate => {
    if (input.length > MAX_LENGTH || input.split(/\r\n|\n|\r/, MAX_ENTRIES + 1).length > MAX_ENTRIES) {
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
    compileTemplate(input, nodes = [], config) {
      if (
        (typeof input !== 'string' && input.target !== definition.type) ||
        nodes.some((node) => node.target !== definition.type) ||
        (config !== undefined && config.target !== definition.type)
      ) {
        throw new TemplateError(definition.type, 'TEMPLATE_MISMATCH');
      }

      try {
        const template = parseTemplate(typeof input === 'string' ? input : serializeTemplate(input));

        if (typeof input !== 'string' && input.format !== template.format) {
          throw new TemplateError(definition.type, 'TEMPLATE_MISMATCH');
        }

        if (config) {
          (definition.merge ?? mergeConfig)(template, config);
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

export function iniTemplate(type: TemplateTarget, sectionName: string): TemplateModule {
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
