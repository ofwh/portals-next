import type { TemplateFormat } from '../types/template';

export const templateFormatOptions = ['yaml', 'json', 'ini'] as const satisfies readonly TemplateFormat[];

export function isTemplateFormat(value: unknown): value is TemplateFormat {
  return templateFormatOptions.some((format) => format === value);
}
