import type { CompileContext } from './types';
import type { CompileErrorCode } from '../types/compile';

export class CompileError extends Error {
  constructor(
    public code: CompileErrorCode,
    public field?: string,
    public index?: number,
  ) {
    super(code);
  }
}

export function warn(context: CompileContext, code: CompileErrorCode, field: string, index?: number): void {
  context.diagnostics.push({ module: 'compile', severity: 'warning', target: context.target, code, field, index });
}
