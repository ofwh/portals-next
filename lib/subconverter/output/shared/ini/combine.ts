import type { IniDocument, IniNodeProjection, IniRuleProjection } from './types';
import type { OutputContext, OutputParts } from '../../../types/output';
import type { IniSection } from '../../../types/providers/ini';
import { templateDocument } from '../template';

export function combine(
  parts: OutputParts<IniNodeProjection, IniRuleProjection, string[]>,
  names: { nodes: string; policies: string; rules: string; remote?: string },
  context: OutputContext,
): IniDocument {
  const sections: IniSection[] = [
    { name: names.nodes, lines: parts.nodes.entries.flatMap((entry) => entry.value.lines) },
    { name: names.policies, lines: parts.policies.value },
    { name: names.rules, lines: parts.rules.value.local },
    ...parts.nodes.entries.flatMap((entry) => entry.value.sections),
  ];

  if (names.remote && parts.rules.value.remote.length) {
    sections.push({ name: names.remote, lines: parts.rules.value.remote });
  }

  const template = context.template;

  if (
    !template ||
    (template.format !== 'surge' &&
      template.format !== 'surfboard' &&
      template.format !== 'quanx' &&
      template.format !== 'loon')
  ) {
    return { sections };
  }

  const base = templateDocument(template, template.format);

  if (!base) {
    return { sections };
  }

  const replacements = new Map<string, IniSection>();

  for (const section of sections) {
    const isRuleSection = section.name === names.rules || section.name === names.remote;

    if (isRuleSection && !context.generateRules) {
      continue;
    }

    replacements.set(section.name, section);
  }

  if (names.remote && context.generateRules && !replacements.has(names.remote)) {
    replacements.set(names.remote, { name: names.remote, lines: [] });
  }

  const combined = base.sections.map((section) => {
    const replacement = replacements.get(section.name);

    replacements.delete(section.name);

    return replacement ?? section;
  });

  combined.push(...replacements.values());

  return { sections: combined };
}
