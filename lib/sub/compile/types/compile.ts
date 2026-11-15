import type { ConfigModule } from './config';
import type { Schema, Source } from './schema';
import type { TemplateModule, TemplateSource } from './template';
import type { ConfigDeclaration, ProxyNode, ProxyProtocol, SubscriptionType } from '../../types';

export type { SubscriptionType } from '../../types';
export type CompileOptions = { index?: number; sectionName?: string; options?: Record<string, unknown> };
export type CompileParams = {
  target?: SubscriptionType;
  template?: TemplateSource;
  nodes?: ProxyNode[];
  config?: readonly ConfigDeclaration[];
  options?: Record<string, unknown>;
};
export type CompileResult = {
  target: SubscriptionType;
  nodes: CompiledNode[];
  content: string;
};
export type NodeSource = ProxyNode & { index: number; sectionName: string; options?: Record<string, unknown> };
export type NodeSchema = Schema<NodeSource>;
export type NodeDefinition = {
  schema: NodeSchema;
  when?: (node: Readonly<NodeSource>) => boolean;
  positional?: readonly string[];
  endpoint?: boolean;
  collection?: 'outbounds' | 'endpoints';
};
export type NodeSection = { name: string; entries: Source };
export type NodeSerialization = { content: string; sections: NodeSection[] };
export type NodeModule = {
  type: SubscriptionType;
  nodes: Readonly<Partial<Record<ProxyProtocol, NodeDefinition>>>;
  serialize: (value: Source, definition: NodeDefinition) => NodeSerialization;
  compileNodes: (nodes?: ProxyNode[], options?: Record<string, unknown>) => CompiledNode[];
};
export type NodeProvider = NodeModule &
  Partial<TemplateModule & ConfigModule> & {
    compile: (input: CompileParams) => CompileResult;
  };
export type CompiledNode = NodeSerialization & {
  target: SubscriptionType;
  value: Source;
  collection?: 'outbounds' | 'endpoints';
};
