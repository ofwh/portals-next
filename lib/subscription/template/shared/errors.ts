export class TemplateParseError extends Error {
  constructor(
    public readonly code: 'INVALID_FORMAT' | 'INVALID_DOCUMENT' | 'INPUT_TOO_LARGE',
    public readonly position = { line: 1, column: 1 },
  ) {
    super(`Invalid template: ${code}`);
    this.name = 'TemplateParseError';
  }
}

export function positionAt(input: string, offset: number): { line: number; column: number } {
  const lines = input.slice(0, offset).split(/\r\n|\n|\r/);

  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}
