import { providers } from './providers';
import type { CompileParams, CompileResult } from './types';

export function compile(input: CompileParams = {}): CompileResult {
  return providers[input.target ?? 'mixed'].compile(input);
}

export { compileConfig, compileNodes, compileTemplate, parseTemplate } from './transformers';
export { COMPILE_TARGET_OPTIONS, COMPILE_TARGETS, isCompileTarget } from '../shared';
export { ConfigCompileError } from './shared/config';
export { TemplateError } from './shared/template';
export type { IniDocument, IniSection, ParsedTemplate, TemplateSource, TemplateModule, TemplateTarget } from './types';
export { providers } from './providers';
export type { ArrayRule, FieldRule, ObjectRule, Schema, SchemaRule, Source } from './types';
export type {
  CompiledConfig,
  CompiledNode,
  CompileOptions,
  CompileParams,
  CompileResult,
  ConfigModule,
  SubscriptionType,
  NodeDefinition,
  NodeModule,
  NodeProvider,
  NodeSchema,
  NodeSection,
  NodeSerialization,
  NodeSource,
} from './types';
