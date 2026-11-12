import { parseRuleContent } from '../../../ruleset/content';
import type { Rule, RuleSet } from '../../../types/ruleset';
import { CompileError, warn } from '../../diagnostics';
import type { CompileContext } from '../../types';

export function rulesFor(context: CompileContext, ruleset: RuleSet, index: number): Rule[] {
  if (ruleset.source.kind === 'inline') {
    return [ruleset.source.rule];
  }

  const address = ruleset.source.address;
  const content =
    context.resources && Object.hasOwn(context.resources, address) ? context.resources[address] : undefined;

  if (content === undefined) {
    throw new CompileError('MISSING_RESOURCE', 'resources', index);
  }

  if (!content.trim()) {
    return [];
  }

  const parsed = parseRuleContent(content, { category: ruleset.category });

  if (!parsed.ok) {
    warn(context, 'INVALID_RESOURCE', 'rulesets', index);

    return [];
  }

  for (let issue = 0; issue < parsed.diagnostics.length; issue++) {
    warn(context, 'UNSUPPORTED_RULE', 'rulesets', index);
  }

  return parsed.items;
}

export function supportsRule(
  context: CompileContext,
  rule: Rule,
  supported: readonly string[],
  inline: boolean,
  index: number,
  exact = false,
): boolean {
  if (!inline && !(exact ? supported.includes(rule.type) : supported.some((type) => rule.type.startsWith(type)))) {
    warn(context, 'UNSUPPORTED_RULE', 'rulesets', index);

    return false;
  }

  return true;
}

export function iniTextRule(rule: Rule, ruleset: RuleSet, inline: boolean): string {
  if (['AND', 'OR', 'NOT'].includes(rule.type)) {
    return [rule.type, ...rule.parameters, ...rule.flags].join(',');
  }

  const final = rule.type === 'MATCH' || rule.type === 'FINAL';
  const type = final && inline ? 'FINAL' : rule.type;

  return [type, ...rule.parameters, ruleset.group, ...rule.flags.slice(0, 1)].join(',');
}
