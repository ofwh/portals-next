import { parseIni, parseJson, parseYaml } from './parsers';
import { positionAt, TEMPLATE_LIMITS, TemplateParseError } from './shared';
import { isTemplateFormat } from '../shared';
import type { TemplateDocument, TemplateFormat } from '../types';

export function parseTemplate(input: string, format: TemplateFormat): TemplateDocument {
  if (!isTemplateFormat(format)) {
    throw new TemplateParseError('INVALID_FORMAT');
  }

  if (
    input.length > TEMPLATE_LIMITS.length ||
    input.split(/\r\n|\n|\r/, TEMPLATE_LIMITS.entries + 1).length > TEMPLATE_LIMITS.entries
  ) {
    throw new TemplateParseError('INPUT_TOO_LARGE');
  }

  const source = input.replace(/^\uFEFF/, '');

  try {
    switch (format) {
      case 'ini':
        return { format, value: parseIni(source) };
      case 'json':
        return { format, value: parseJson(source) };
      case 'yaml':
        return { format, value: parseYaml(source) };
    }
  } catch (error) {
    if (error instanceof TemplateParseError) {
      throw error;
    }

    const match = error instanceof SyntaxError ? /position (\d+)/.exec(error.message) : null;

    throw new TemplateParseError('INVALID_DOCUMENT', match ? positionAt(source, Number(match[1])) : undefined);
  }
}
