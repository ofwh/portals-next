import { isRuleCategory, ruleCategoryTransformers } from '../../shared/ruleset';
import type { RulesetTransformer } from '../../types/ruleset';

export const rulesetTransformerLabels = {
  surge: 'Surge',
  loon: 'Loon',
  quanx: 'Quantumult X',
  clash: 'Clash',
  singbox: 'sing-box',
} as const satisfies Record<RulesetTransformer, string>;

export const rulesetTransformerOptions = Object.entries(rulesetTransformerLabels).map(([value, label]) => ({
  value,
  label,
}));

export function isRulesetTransformer(value: unknown): value is RulesetTransformer {
  return typeof value === 'string' && Object.hasOwn(rulesetTransformerLabels, value);
}

export function getRulesetTransformer(value: unknown): RulesetTransformer | undefined {
  if (isRulesetTransformer(value)) {
    return value;
  }

  return isRuleCategory(value) ? ruleCategoryTransformers[value] : undefined;
}
