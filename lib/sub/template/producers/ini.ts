import type { IniDocument } from '../../types';

export function serializeIni(document: IniDocument): string {
  return document.sections
    .map((section) => {
      const lines = [...(section.name === null ? [] : [section.header ?? `[${section.name}]`]), ...section.lines];

      while (lines.length && !lines[lines.length - 1].trim()) {
        lines.pop();
      }

      return lines.join('\n');
    })
    .filter(Boolean)
    .join('\n\n');
}
