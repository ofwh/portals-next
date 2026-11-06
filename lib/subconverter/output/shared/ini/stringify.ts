import type { IniDocument } from './types';

export function stringify(config: IniDocument): string {
  return config.sections.map((section) => `[${section.name}]\n${section.lines.join('\n')}`).join('\n\n') + '\n';
}
