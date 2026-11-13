import { providers } from './providers';
import type { CompileParams, CompileResult } from './types';

export function compile(input: CompileParams = {}): CompileResult {
  return providers[input.target ?? 'mixed'].compile(input);
}

export { compileNodes, compileTemplate, parseTemplate } from './transformers';
export { TemplateError } from './shared/template';
export type { IniDocument, IniSection, ParsedTemplate, TemplateSource, TemplateModule, TemplateTarget } from './types';
export { providers } from './providers';
export type { ArrayRule, FieldRule, ObjectRule, Schema, SchemaRule, Source } from './types';
export type {
  CompiledNode,
  CompileOptions,
  CompileParams,
  CompileResult,
  SubscriptionType,
  NodeDefinition,
  NodeModule,
  NodeProvider,
  NodeSchema,
  NodeSection,
  NodeSerialization,
  NodeSource,
} from './types';
