import type { PolicyErrorCode } from '../shared/errors';
import type { PolicyDiagnostic, SourcePosition } from '../types/diagnostic';

export function diagnostic(
  format: string,
  code: PolicyErrorCode,
  position: SourcePosition = { line: 1, column: 1 },
  field?: string,
): PolicyDiagnostic {
  return {
    severity: 'error',
    module: 'policy',
    format: typeof format === 'string' ? format : '',
    code,
    position,
    ...(field ? { field } : {}),
  };
}

export class EntryError extends Error {
  constructor(
    public code: PolicyErrorCode,
    public field?: string,
  ) {
    super(code);
  }
}
