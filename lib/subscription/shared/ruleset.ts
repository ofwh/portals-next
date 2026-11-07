import type { RuleCategory, RulesetFormat, RulesetResolver } from '../types/ruleset';

export const rulesetFormatOptions = ['ini', 'yaml', 'toml'] as const satisfies readonly RulesetFormat[];

export const rulesetResolverOptions = {
  surge: 'Surge',
  quanx: 'Quantumult X',
  clash: 'Clash',
} as const satisfies Record<RulesetResolver, string>;

export const ruleCategoryResolvers = {
  surge: 'surge',
  quanx: 'quanx',
  'clash-domain': 'clash',
  'clash-ipcidr': 'clash',
  'clash-classic': 'clash',
} as const satisfies Record<RuleCategory, RulesetResolver>;

export function isRulesetFormat(value: unknown): value is RulesetFormat {
  return rulesetFormatOptions.some((format) => format === value);
}

export function isRulesetResolver(value: unknown): value is RulesetResolver {
  return typeof value === 'string' && Object.hasOwn(rulesetResolverOptions, value);
}

export function isRuleCategory(value: unknown): value is RuleCategory {
  return typeof value === 'string' && Object.hasOwn(ruleCategoryResolvers, value);
}

export function getRulesetResolver(value: unknown): RulesetResolver | undefined {
  if (isRulesetResolver(value)) {
    return value;
  }

  return isRuleCategory(value) ? ruleCategoryResolvers[value] : undefined;
}
