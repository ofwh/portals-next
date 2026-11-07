import type { RulesetErrorCode } from '../shared/errors';

export type SourcePosition = { line: number; column: number; index?: number };

export type Diagnostic = {
  severity: 'error' | 'warning';
  module: 'ruleset';
  format: string;
  code: RulesetErrorCode;
  position: SourcePosition;
  field?: string;
  ruleset?: string;
};

export type ParseResult<T> = { ok: true; items: T[]; diagnostics: Diagnostic[] } | { ok: false; error: Diagnostic };
