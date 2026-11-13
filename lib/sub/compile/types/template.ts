import type { CompiledNode, SubscriptionType } from './compile';
import type { Source } from './schema';

export type IniSection = { name: string | null; header?: string; lines: string[] };
export type IniDocument = { sections: IniSection[] };
export type TemplateTarget = Exclude<SubscriptionType, 'mixed'>;
export type ParsedTemplate = { target: TemplateTarget } & (
  { format: 'yaml' | 'json'; value: Source } | { format: 'ini'; value: IniDocument }
);
export type TemplateSource = string | ParsedTemplate;
export type TemplateModule = {
  parseTemplate: (input: string) => ParsedTemplate;
  compileTemplate: (input: TemplateSource, nodes?: readonly CompiledNode[]) => string;
};
