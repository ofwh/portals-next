import type { SourcePosition } from './diagnostic';

export type TemplateFormat = 'yaml' | 'json' | 'ini';
export type TemplateValue = null | boolean | number | string | TemplateValue[] | { [key: string]: TemplateValue };
export type IniEntry = { key: string | null; value: string };
export type IniSection = { name: string | null; entries: IniEntry[] };
export type IniDocument = { sections: IniSection[] };
export type Template<T = TemplateValue | IniDocument> = { format: TemplateFormat; value: T };
export type ParsedTemplate =
  (Template<TemplateValue> & { format: 'yaml' | 'json' }) | (Template<IniDocument> & { format: 'ini' });
export type TemplateDiagnostic = {
  module: 'template';
  severity: 'error';
  format: string;
  code: 'INVALID_FORMAT' | 'INVALID_DOCUMENT' | 'INPUT_TOO_LARGE';
  position: SourcePosition;
};
export type TemplateParseResult = { ok: true; template: ParsedTemplate } | { ok: false; error: TemplateDiagnostic };
