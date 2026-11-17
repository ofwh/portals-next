import type { IniDocument } from '../../types';

export function serializeIni(document: IniDocument): string {
  return document.sections
    .map((section) => {
      let start = 0;
      let end = section.lines.length;

      while (start < end && !section.lines[start].trim()) {
        start++;
      }

      while (end > start && !section.lines[end - 1].trim()) {
        end--;
      }

      const lines = [
        ...(section.name === null ? [] : [section.header ?? `[${section.name}]`]),
        ...section.lines.slice(start, end),
      ];

      return lines.join('\n');
    })
    .filter(Boolean)
    .join('\n\n');
}
