import type { Diagnostic, SourcePosition } from '../types/diagnostic';

export function diagnostic(
  format: string,
  code: Diagnostic['code'],
  position: SourcePosition = { line: 1, column: 1 },
  field?: string,
): Diagnostic {
  return {
    severity: 'error',
    module: 'ruleset',
    format: typeof format === 'string' ? format : '',
    code,
    position,
    ...(field ? { field } : {}),
  };
}

export class EntryError extends Error {
  constructor(
    public code: Diagnostic['code'],
    public field?: string,
  ) {
    super(code);
  }
}
