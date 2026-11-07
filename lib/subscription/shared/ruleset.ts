import type { RuleCategory, RulesetTransformer } from '../types/ruleset';

export const ruleCategoryTransformers = {
  surge: 'surge',
  quanx: 'quanx',
  'clash-domain': 'clash',
  'clash-ipcidr': 'clash',
  'clash-classic': 'clash',
} as const satisfies Record<RuleCategory, RulesetTransformer>;

export function isRuleCategory(value: unknown): value is RuleCategory {
  return typeof value === 'string' && Object.hasOwn(ruleCategoryTransformers, value);
}
