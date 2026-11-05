import type { PolicyConfigFields } from '@/lib/subconverter/types/policies';
import type { RuleSetConfigFields } from '@/lib/subconverter/types/rulesets';
import type { ProxyNodeFields } from './proxy-node';

export type OutputTarget =
  'clash' | 'clashr' | 'surge' | 'quanx' | 'loon' | 'surfboard' | 'stash' | 'singbox' | 'ss' | 'mixed' | 'shadowrocket';
export type JsonValue = null | boolean | number | string | JsonValue[] | NativeObject;
export interface NativeObject {
  [key: string]: JsonValue;
}
export interface OutputElements {
  nodes: readonly ProxyNodeFields[];
  rules: readonly RuleSetConfigFields[];
  policies: readonly PolicyConfigFields[];
}
export interface SymbolBinding {
  kind: 'node' | 'group' | 'builtin';
  inputName: string;
  outputName: string;
}
export interface OutputIssue {
  stage: 'node' | 'policy' | 'rule' | 'assembly';
  index?: number;
  field?: string;
  message: string;
}
export interface ConvertedNode<N> {
  sourceIndex: number;
  fields: ProxyNodeFields;
  value: N;
  symbol: SymbolBinding;
}
export interface ConvertedNodes<N> {
  entries: ConvertedNode<N>[];
  issues: OutputIssue[];
}
export interface ConvertedPolicies<P> {
  value: P;
  symbols: SymbolBinding[];
  issues: OutputIssue[];
}
export interface ConvertedRules<R> {
  value: R;
  issues: OutputIssue[];
}
export interface MaterializedRuleSource {
  index: number;
  lines: string[];
}
export interface OutputContext {
  symbols: readonly SymbolBinding[];
  ruleSources: readonly MaterializedRuleSource[];
}
export interface OutputParts<N, R, P> {
  nodes: ConvertedNodes<N>;
  rules: ConvertedRules<R>;
  policies: ConvertedPolicies<P>;
}
export interface OutputAdapter<N, R, P, D> {
  readonly target: OutputTarget;
  readonly mediaType: 'text/yaml' | 'text/plain' | 'application/json';
  nodes: { transform(nodes: OutputElements['nodes'], context: OutputContext): ConvertedNodes<N> };
  policies: {
    transform(
      policies: OutputElements['policies'],
      nodes: ConvertedNodes<N>,
      context: OutputContext,
    ): ConvertedPolicies<P>;
  };
  rules: { transform(rules: OutputElements['rules'], context: OutputContext): ConvertedRules<R> };
  combine(parts: OutputParts<N, R, P>, context: OutputContext): D;
  toString(config: D): string;
}

export interface ConfigArtifact<D> {
  target: OutputTarget;
  document: D;
  mediaType: string;
  content: string;
  issues: OutputIssue[];
}
