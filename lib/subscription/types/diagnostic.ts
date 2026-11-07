import type { PolicyErrorCode, RulesetErrorCode } from '../shared/errors';

export type SourcePosition = { line: number; column: number; index?: number };

type DiagnosticContext = {
  severity: 'error' | 'warning';
  format: string;
  position: SourcePosition;
  field?: string;
  text?: string;
};

export type Diagnostic = DiagnosticContext & {
  module: 'ruleset';
  code: RulesetErrorCode;
  ruleset?: string;
};

export type PolicyDiagnostic = DiagnosticContext & { module: 'policy'; code: PolicyErrorCode };

export type ParseResult<T, D = Diagnostic> = { ok: true; items: T[]; diagnostics: D[] } | { ok: false; error: D };
