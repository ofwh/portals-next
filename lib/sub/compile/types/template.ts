import type { CompiledNode, SubscriptionType } from './compile';
import type { CompiledConfig } from './config';
import type { TemplateDocument } from '../../types';

export type { IniDocument, IniSection } from '../../types';
export type TemplateTarget = Exclude<SubscriptionType, 'mixed'>;
export type ParsedTemplate = { target: TemplateTarget } & TemplateDocument;
export type TemplateSource = string | ParsedTemplate;
export type TemplateModule = {
  parseTemplate: (input: string) => ParsedTemplate;
  compileTemplate: (input: TemplateSource, nodes?: readonly CompiledNode[], config?: CompiledConfig) => string;
};
