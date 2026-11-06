import type { RuleGroupFields, RuleResourceFormat, RuleSourceFormat } from '@/lib/subconverter/types/rulesets';

export const ruleGroupTypes = ['inline', 'remote'] as const satisfies readonly RuleGroupFields['type'][];
export const ruleSourceFormats = [
  'surge',
  'quanx',
  'clash-domain',
  'clash-ipcidr',
  'clash-classic',
] as const satisfies readonly RuleSourceFormat[];
export const ruleResourceFormats = ['yaml', 'text', 'mrs'] as const satisfies readonly RuleResourceFormat[];
export const defaultRuleInterval = 86400;
