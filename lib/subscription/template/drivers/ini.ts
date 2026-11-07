import { DocumentError } from '../../shared/document';
import type { IniDocument, IniSection } from '../../types/template';

export function parse(input: string): IniDocument {
  const sections: IniSection[] = [];
  let current: IniSection | undefined;

  for (const [index, raw] of input
    .replace(/^\uFEFF/, '')
    .split(/\r\n|\n|\r/)
    .entries()) {
    const line = raw.trim();

    if (!line || /^(?:;|#|\/\/)/.test(line)) {
      continue;
    }

    if (line.startsWith('[')) {
      const match = /^\[([^\]]+)\]\s*(?:[;#].*)?$/.exec(line);

      if (!match || !match[1].trim()) {
        throw new DocumentError({ line: index + 1, column: raw.indexOf('[') + 1 });
      }

      current = { name: match[1].trim(), entries: [] };
      sections.push(current);
      continue;
    }

    if (!current) {
      current = { name: null, entries: [] };
      sections.push(current);
    }

    const separator = line.indexOf('=');

    if (separator === 0) {
      throw new DocumentError({ line: index + 1, column: raw.indexOf('=') + 1 });
    }

    current.entries.push(
      separator < 0
        ? { key: null, value: line }
        : { key: line.slice(0, separator).trim(), value: line.slice(separator + 1).trim() },
    );
  }

  return { sections };
}
