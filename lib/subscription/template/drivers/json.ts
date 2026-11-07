import { DocumentError } from '../../shared/document';

export function parse(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch (error) {
    const message = error instanceof SyntaxError ? error.message : '';
    const location = /line (\d+) column (\d+)/.exec(message);

    if (location) {
      throw new DocumentError({ line: Number(location[1]), column: Number(location[2]) });
    }

    const offset = /position (\d+)/.exec(message);
    const prefix = input.slice(0, offset ? Number(offset[1]) : input.length);
    const lines = prefix.split(/\r\n|\n|\r/);

    throw new DocumentError({ line: lines.length, column: lines[lines.length - 1].length + 1 });
  }
}
