import type { ProxyGroup } from './policy';
import type { ProxyNode } from './proxy-node';
import type { RuleSet } from './ruleset';
import type { ParsedTemplate } from './template';

export type CompileTarget = 'mixed' | 'clash' | 'loon' | 'singbox' | 'quanx' | 'surge' | 'surfboard';
export type CompileOptions = { enableRuleGenerator?: boolean; overwriteOriginalRules?: boolean };
export type CompileParams = {
  target: CompileTarget;
  nodes: ProxyNode[];
  groups: ProxyGroup[];
  rulesets: RuleSet[];
  template?: ParsedTemplate;
  surgeSsrPath?: string;
  resources?: Readonly<Record<string, string>>;
};
export type CompileErrorCode =
  | 'INVALID_TARGET'
  | 'INVALID_INPUT'
  | 'INVALID_TEMPLATE'
  | 'UNSUPPORTED_NODE'
  | 'UNSUPPORTED_GROUP'
  | 'UNSUPPORTED_RULE'
  | 'INVALID_SELECTOR'
  | 'MISSING_RESOURCE'
  | 'INVALID_RESOURCE'
  | 'INVALID_REFERENCE'
  | 'DUPLICATE_TAG'
  | 'CONFLICTING_RULE_SET'
  | 'CIRCULAR_GROUP_REFERENCE'
  | 'SERIALIZATION_FAILED';
export type CompileDiagnostic = {
  module: 'compile';
  severity: 'error' | 'warning';
  target: string;
  code: CompileErrorCode;
  field?: string;
  index?: number;
};
export type CompileResult =
  | { ok: true; content: string; contentType: string; diagnostics: CompileDiagnostic[] }
  | { ok: false; error: CompileDiagnostic; diagnostics: CompileDiagnostic[] };
