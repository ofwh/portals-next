import { parse as parseToml, TomlError } from 'smol-toml';
import { isNode, LineCounter, parseDocument, visit } from 'yaml';
import { splitDelimited, textLimits, unquote } from './text';
import type { SourcePosition } from '../types/diagnostic';

export class DocumentError extends Error {
  constructor(public position: SourcePosition = { line: 1, column: 1 }) {
    super('Invalid document');
  }
}

function validateStructure(value: unknown, depth = 0, ancestors = new Set<object>(), budget = { count: 0 }): void {
  if (++budget.count > textLimits.entries * 16 || depth > textLimits.depth) {
    throw new DocumentError();
  }

  if (value === null || typeof value !== 'object') {
    return;
  }

  if (ancestors.has(value)) {
    throw new DocumentError();
  }

  ancestors.add(value);

  for (const child of Object.values(value)) {
    validateStructure(child, depth + 1, ancestors, budget);
  }

  ancestors.delete(value);
}

function tomlTablePositions(input: string): Map<string, SourcePosition[]> {
  const positions = new Map<string, SourcePosition[]>();
  let multiline = '';

  for (const [index, line] of input.split(/\r\n|\n|\r/).entries()) {
    const header = !multiline && /^\s*\[\[\s*(.*?)\s*\]\]\s*(?:#.*)?$/.exec(line);

    if (header) {
      const key = JSON.stringify(splitDelimited(header[1], '.').map(unquote));
      const entries = positions.get(key) ?? [];

      entries.push({ line: index + 1, column: line.indexOf('[') + 1 });
      positions.set(key, entries);
    }

    let quote = '';

    for (let offset = 0; offset < line.length; offset++) {
      const char = line[offset];
      const triple = line.slice(offset, offset + 3);

      if (char === '\\' && (multiline === '"""' || quote === '"')) {
        offset++;
      } else if (multiline) {
        if (triple === multiline) {
          multiline = '';
          offset += 2;
        }
      } else if (quote) {
        if (char === quote) {
          quote = '';
        }
      } else if (char === '#') {
        break;
      } else if (triple === '"""' || triple === "'''") {
        multiline = triple;
        offset += 2;
      } else if (char === '"' || char === "'") {
        quote = char;
      }
    }
  }

  return positions;
}

export function parseStructuredDocument(input: string, format: 'yaml' | 'toml') {
  if (format === 'yaml') {
    const lineCounter = new LineCounter();
    const document = parseDocument(input, { lineCounter, uniqueKeys: true, strict: true });
    const positionAt = (offset: number): SourcePosition => {
      const { line, col } = lineCounter.linePos(offset);

      return { line, column: col };
    };

    const issue = document.errors[0] ?? document.warnings[0];

    if (issue) {
      throw new DocumentError(positionAt(issue.pos[0]));
    }

    let count = 0;

    visit(document, {
      Node(_key, node, path) {
        if (++count > textLimits.entries * 16 || path.length > textLimits.depth) {
          throw new DocumentError(positionAt(node.range?.[0] ?? 0));
        }
      },
    });

    const value: unknown = document.toJS({ maxAliasCount: 100 });

    validateStructure(value);

    return {
      value,
      position(path: (string | number)[]): SourcePosition {
        const node: unknown = document.getIn(path, true);

        return positionAt(isNode(node) ? (node.range?.[0] ?? 0) : 0);
      },
    };
  }

  try {
    const value: unknown = parseToml(input, { maxDepth: textLimits.depth });
    const tables = tomlTablePositions(input);

    validateStructure(value);

    return {
      value,
      position(path: (string | number)[]): SourcePosition {
        const index = path.findIndex((part) => typeof part === 'number');
        const table = tables.get(JSON.stringify(index < 0 ? path : path.slice(0, index)));
        const entry = index < 0 ? 0 : path[index];

        return table?.[typeof entry === 'number' ? entry : 0] ?? { line: 1, column: 1 };
      },
    };
  } catch (error) {
    throw new DocumentError(error instanceof TomlError ? { line: error.line, column: error.column } : undefined);
  }
}
