import { freezeDeep } from '@/lib/shared/data';
import { parse as parseIni } from './drivers/ini';
import { parse as parseJson } from './drivers/json';
import { parse as parseYaml } from './drivers/yaml';
import { templateType } from '../schemas/template';
import { DocumentError } from '../shared/document';
import { isTemplateFormat } from '../shared/template';
import { textLimits } from '../shared/text';
import type { TemplateFormat, TemplateParseResult } from '../types/template';

const drivers = { yaml: parseYaml, json: parseJson, ini: parseIni };

export function parse(input: string, options: { format: TemplateFormat }): TemplateParseResult {
  const { format } = options;
  const failure = (
    code: 'INVALID_FORMAT' | 'INVALID_DOCUMENT' | 'INPUT_TOO_LARGE',
    error?: unknown,
  ): TemplateParseResult => ({
    ok: false,
    error: {
      module: 'template',
      severity: 'error',
      format,
      code,
      position: error instanceof DocumentError ? error.position : { line: 1, column: 1 },
    },
  });

  if (!isTemplateFormat(format)) {
    return failure('INVALID_FORMAT');
  }

  if (
    input.length > textLimits.length ||
    input.split(/\r\n|\n|\r/, textLimits.entries + 1).length > textLimits.entries
  ) {
    return failure('INPUT_TOO_LARGE');
  }

  try {
    const template = templateType.parse({ format, value: drivers[format](input) });

    return { ok: true, template: freezeDeep(template) };
  } catch (error) {
    return failure('INVALID_DOCUMENT', error);
  }
}

const service = { parse };

export default service;
