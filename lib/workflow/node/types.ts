import type { MessageKeys, NestedKeyOf } from 'next-intl';
import type { ComponentType } from 'react';
import type { Locale } from '@/lib/api';
import type { NamedType, Parser, TypeDescriptor, ValueSchema } from '@/lib/types/workflow';
import type { nodeMessages } from './messages';
import type { NodeInstance, NodeStatus } from '../model';

export interface InputPort<T> {
  schema: ValueSchema<T>;
  required: boolean;
  multiple: boolean;
}
export interface ConfiguredType {
  field: string;
  types: Record<string, TypeDescriptor>;
}
export interface OutputPort<T> {
  schema: ValueSchema<T>;
  multiple: boolean;
  typeByConfig?: ConfiguredType;
}
export interface InputSource {
  nodeId: string;
  type: TypeDescriptor;
}
export interface ExecutionContext {
  runId: string;
  nodeId: string;
  signal: AbortSignal;
  inputSources?: readonly InputSource[];
}
export interface NodeLabel {
  name: string;
  nameKey?: MessageKeys<typeof nodeMessages.en, NestedKeyOf<typeof nodeMessages.en>>;
}
export interface NodeModule<I, C, O, RunInput = I> extends NodeLabel {
  type: string;
  version: number;
  singleton?: boolean;
  input: InputPort<I> | null;
  output: OutputPort<O> | null;
  configSchema: Parser<C>;
  defaultConfig: C;
  parseConfig(raw: unknown): C;
  parseInput(values: readonly I[], context: ExecutionContext): RunInput;
  execute(input: RunInput, config: C, context: ExecutionContext): Promise<O>;
}
export interface NodeManifest extends NodeLabel {
  type: string;
  version: number;
  singleton?: boolean;
  input: { type: TypeDescriptor; required: boolean; multiple: boolean } | null;
  output: { type: TypeDescriptor; multiple: boolean; typeByConfig?: ConfiguredType } | null;
}
export interface NodeGroup extends NodeLabel {
  id: string;
  nodes: readonly NodeManifest[];
}
export interface NodeModuleGroup extends NodeLabel {
  id: string;
  nodes: readonly NodeModule<unknown, unknown, unknown, unknown>[];
  types?: readonly NamedType<unknown>[];
}
export interface RegisteredNode {
  manifest: NodeManifest;
  defaultConfig: unknown;
  parseConfig(raw: unknown, context?: Partial<ExecutionContext>): unknown;
  run(values: readonly unknown[], config: unknown, context: ExecutionContext): Promise<unknown>;
}
export interface ConfigIssue {
  path: readonly (string | number)[];
  message: string;
}
export interface NodeFormProps<C> {
  value: C;
  onChange(value: C): void;
  disabled: boolean;
  issues: readonly ConfigIssue[];
}
export interface NodeConfigValidationContext {
  locale?: Locale;
}
export interface NodeConfigView<C> {
  validate?(value: C, context?: NodeConfigValidationContext): ConfigIssue[];
  className?: string;
  Form: ComponentType<NodeFormProps<C>>;
}
export interface NodeContentProps<C> {
  node: Readonly<NodeInstance<C>>;
  selected: boolean;
  status?: NodeStatus;
  mode: 'canvas' | 'palette' | 'drag-preview';
}
export interface NodeDisplayView<C> {
  size: { width: number; height: number };
  Content: ComponentType<NodeContentProps<C>>;
}
export interface NodeView<C> {
  type: string;
  icon: ComponentType<{ className?: string }>;
  config?: NodeConfigView<C>;
  display?: NodeDisplayView<C>;
}
