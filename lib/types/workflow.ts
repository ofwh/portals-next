import type { NodeGroup, NodeManifest } from '@/lib/workflow/node/types';

export interface WorkflowNodeCatalog {
  groups: NodeGroup[];
  nodes: NodeManifest[];
  defaults: Record<string, unknown>;
}

export type WorkflowArray<T = unknown> = T[];
export type WorkflowObject<T = unknown> = Record<string, T>;

export interface WorkflowDataTypes {
  String: string;
  Number: number;
  Boolean: boolean;
  null: null;
  Array: WorkflowArray;
  Object: WorkflowObject;
  any: unknown;
}

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
