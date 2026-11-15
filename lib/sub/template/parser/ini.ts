import type { IniDocument } from '../../types';
import { TemplateParseError } from '../shared';

export function parseIni(input: string): IniDocument {
  const document: IniDocument = { sections: [] };
  let current: IniDocument['sections'][number] | undefined;

  for (const [index, raw] of input.split(/\r\n|\n|\r/).entries()) {
    const line = raw.trim();

    if (line.startsWith('[')) {
      const match = /^\[([^\]]+)\]\s*(?:[;#].*)?$/.exec(line);

      if (!match || !match[1].trim()) {
        throw new TemplateParseError('INVALID_DOCUMENT', { line: index + 1, column: raw.indexOf('[') + 1 });
      }

      current = { name: match[1].trim(), header: raw, lines: [] };
      document.sections.push(current);
    } else {
      if (!current) {
        current = { name: null, lines: [] };
        document.sections.push(current);
      }

      current.lines.push(raw);
    }
  }

  return document;
}
