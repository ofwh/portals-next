import logger from '@/lib/api/logger';
import { providers } from './providers';
import { ConfigCompileError } from './shared/config';
import type {
  CompiledConfig,
  CompiledNode,
  CompileParams,
  CompileResult,
  ParsedTemplate,
  SubscriptionType,
  TemplateSource,
  TemplateTarget,
} from './types';
import type { ConfigDeclaration, ProxyNode } from '../types';

export function compile(input: CompileParams = {}): CompileResult {
  return providers[input.target ?? 'mixed'].assemble(input);
}

export function compileNodes(
  nodes?: ProxyNode[],
  target: SubscriptionType = 'mixed',
  options?: Record<string, unknown>,
): CompiledNode[] {
  if (!Object.hasOwn(providers, target)) {
    logger.info(`Unsupported subscription target "${target}"`);

    return [];
  }

  return providers[target].compileNodes(nodes, options);
}

export function compileConfig(
  config: readonly ConfigDeclaration[],
  target: TemplateTarget,
  nodes: readonly CompiledNode[] = [],
): CompiledConfig {
  if (!Object.hasOwn(providers, target)) {
    logger.info(`Unsupported subscription target "${target}"`);

    throw new ConfigCompileError(target, 'Unsupported output target');
  }

  return providers[target].compileConfig(config, nodes);
}

export function parseTemplate(input: string, target: TemplateTarget): ParsedTemplate {
  return providers[target].parseTemplate(input);
}

export function compileTemplate(
  input: TemplateSource,
  target: TemplateTarget,
  nodes: readonly CompiledNode[] = [],
  config?: CompiledConfig,
): string {
  return providers[target].compileTemplate(input, nodes, config);
}

export { COMPILE_TARGET_OPTIONS, COMPILE_TARGETS, isCompileTarget } from '../shared';
export { ConfigCompileError };
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
