import type { OutputIssue } from '../../types/output';

export class OutputError extends Error {
  constructor(
    readonly stage: OutputIssue['stage'],
    readonly index: number,
    readonly field: string,
    message: string,
  ) {
    super(message);
  }
}

export function fail(stage: OutputIssue['stage'], index: number, field: string, message: string): never {
  throw new OutputError(stage, index, field, message);
}
