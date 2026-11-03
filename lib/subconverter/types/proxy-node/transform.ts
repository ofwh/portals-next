import type { ProxyType, SupportedNodeFields } from './common';
import type { ProxyNodeFields } from './fields';

export interface Transformer<N, F> {
  (targetType: 'fields', nodes: readonly N[]): F[];
  (targetType: 'node', nodes: readonly ProxyNodeFields[]): N[];
}

export interface TransformOptions<N, S extends readonly ProxyType[]> {
  provider: string;
  supports: S;
  readNode(value: unknown): N;
  toFields(node: N): ProxyNodeFields | ProxyNodeFields[];
  toNode(fields: SupportedNodeFields<S[number]>): N;
}

export type TransformDirection = 'fields' | 'node' | 'parse';
