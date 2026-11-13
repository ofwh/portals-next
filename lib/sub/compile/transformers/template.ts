import { providers } from '../providers';
import type { CompiledNode, ParsedTemplate, TemplateSource, TemplateTarget } from '../types';

export function parseTemplate(input: string, target: TemplateTarget): ParsedTemplate {
  return providers[target].parseTemplate(input);
}

export function compileTemplate(
  input: TemplateSource,
  target: TemplateTarget,
  nodes: readonly CompiledNode[] = [],
): string {
  return providers[target].compileTemplate(input, nodes);
}
