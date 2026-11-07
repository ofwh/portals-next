export const textLimits = { length: 8 * 1024 * 1024, entries: 100_000, line: 64 * 1024, depth: 64 };

export function sourceLine(input: string, line: number): string {
  return input.split(/\r\n|\n|\r/, line)[line - 1] ?? '';
}

export function splitDelimited(input: string, delimiter = ',', nested = false, maxParts = Infinity): string[] {
  const result: string[] = [];
  let start = 0;
  let quote = '';
  let escaped = false;
  let depth = 0;
  let tokenStart = 0;

  for (let index = 0; index < input.length; index++) {
    const char = input[index];

    if (index === tokenStart && /\s/.test(char)) {
      tokenStart++;
    }

    if (escaped) {
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (quote) {
      if (char === quote) {
        if (input[index + 1] === quote) {
          index++;
        } else {
          quote = '';
        }
      }
    } else if ((char === '"' || char === "'") && index === tokenStart) {
      quote = char;
    } else if (nested && char === '(') {
      depth++;
      tokenStart = index + 1;
      if (depth > textLimits.depth) {
        throw new Error('Nesting limit');
      }
    } else if (nested && char === ')') {
      if (--depth < 0) {
        throw new Error('Unbalanced parentheses');
      }
    } else if (char === delimiter && depth === 0) {
      result.push(input.slice(start, index).trim());
      start = index + 1;
      tokenStart = start;

      if (result.length === maxParts - 1) {
        result.push(input.slice(start).trim());

        return result;
      }
    } else if (char === delimiter) {
      tokenStart = index + 1;
    }
  }

  if (quote || depth) {
    throw new Error('Incomplete token');
  }

  result.push(input.slice(start).trim());

  return result;
}

export function unquote(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replaceAll('""', '"').replaceAll('\\"', '"');
  }

  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replaceAll("''", "'");
  }

  return value;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
