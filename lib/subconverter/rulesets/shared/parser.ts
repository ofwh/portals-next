import { ConfigurationFieldError } from '@/lib/subconverter/configuration/errors';
import { parseCondition, validateRule } from '@/lib/subconverter/rulesets/output/shared';
import type { RuleCondition } from '@/lib/subconverter/rulesets/output/shared';
import { readRulesetNodes } from '@/lib/subconverter/rulesets/shared/dataset';
import { transform } from '@/lib/subconverter/rulesets/shared/transform';
import type { ConfigObject } from '@/lib/subconverter/types/configuration';
import type { RuleSetConfigFields } from '@/lib/subconverter/types/rulesets';

export type RuleOption = 'no-resolve' | 'resourceFormat';

export function parseRules(configuration: ConfigObject): RuleSetConfigFields[] {
  const { nodes } = readRulesetNodes(configuration);
  const definitions = nodes.map((node) => {
    if (typeof node === 'string') {
      return node;
    }

    const type = node.type === 'surge' ? 'surge-ruleset' : node.type === 'quanx' ? 'quantumultx' : node.type;

    return { ...node, type };
  });

  return transform(definitions);
}

export function validateRuleOptions(rule: RuleSetConfigFields, allowed: readonly RuleOption[]): void {
  const noResolve = rule.type === 'remote' ? rule.noResolve : /,no-resolve$/i.test(rule.rule);

  if (noResolve && !allowed.includes('no-resolve')) {
    throw new ConfigurationFieldError('no-resolve', 'Unsupported rule option for the selected client');
  }

  if (rule.type === 'remote' && rule.resourceFormat && !allowed.includes('resourceFormat')) {
    throw new ConfigurationFieldError('stash-format', 'Unsupported resource format for the selected client');
  }
}

export function inlineCondition(rule: RuleSetConfigFields): RuleCondition | undefined {
  return rule.type === 'inline' ? parseCondition(rule.rule, 0) : undefined;
}

export function validateInlineRule(rule: RuleSetConfigFields, types: readonly string[], noResolve = false): void {
  const condition = inlineCondition(rule);

  if (condition) {
    validateRule(condition, types, 0, noResolve);
  }
}
