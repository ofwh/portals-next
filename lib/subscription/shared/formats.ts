import type { TemplateFormat } from '../types';

export const TEMPLATE_FORMAT_OPTIONS = ['yaml', 'json', 'ini'] as const;

export function isTemplateFormat(value: unknown): value is TemplateFormat {
  return TEMPLATE_FORMAT_OPTIONS.some((format) => format === value);
}
