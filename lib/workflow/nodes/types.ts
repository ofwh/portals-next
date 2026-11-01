import type { ComponentType } from 'react';
import type { NodeInstance, NodeStatus } from '../model';

export type TypeDescriptor =
  | { kind: 'any' }
  | { kind: 'string' | 'number' | 'boolean' | 'null' }
  | { kind: 'array'; items: TypeDescriptor }
  | { kind: 'record'; values: TypeDescriptor }
  | { kind: 'union'; types: TypeDescriptor[] }
  | { kind: 'ref'; id: string; version: number };
export interface Parser<T> {
  parse(value: unknown): T;
}
export interface ValueSchema<T> extends Parser<T> {
  descriptor: TypeDescriptor;
}
export interface NamedType<T> extends ValueSchema<T> {
  descriptor: { kind: 'ref'; id: string; version: number };
  base: TypeDescriptor;
}
export interface InputPort<T> {
  schema: ValueSchema<T>;
  required: boolean;
  multiple: boolean;
}
export interface OutputPort<T> {
  schema: ValueSchema<T>;
  multiple: boolean;
}
export interface ExecutionContext {
  runId: string;
  nodeId: string;
  signal: AbortSignal;
}
export interface NodeLabel {
  name: string;
  nameKey?: string;
}
export interface NodeModule<I, C, O, RunInput = I> extends NodeLabel {
  type: string;
  version: number;
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
  input: { type: TypeDescriptor; required: boolean; multiple: boolean } | null;
  output: { type: TypeDescriptor; multiple: boolean } | null;
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
  parseConfig(raw: unknown): unknown;
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
export interface NodeConfigView<C> {
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
  config: NodeConfigView<C>;
  display?: NodeDisplayView<C>;
}
