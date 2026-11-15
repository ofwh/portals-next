import type { TEMPLATE_FORMAT_OPTIONS } from '../shared/formats';

export type TemplateFormat = (typeof TEMPLATE_FORMAT_OPTIONS)[number];
export type IniSection = { name: string | null; header?: string; lines: string[] };
export type IniDocument = { sections: IniSection[] };
export type TemplateDocument =
  { format: 'yaml' | 'json'; value: Record<string, unknown> } | { format: 'ini'; value: IniDocument };
