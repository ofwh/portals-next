import { iniTextRule, supportsRule } from './shared';
import type { Rule, RuleSet } from '../../../types/ruleset';
import type { CompileContext } from '../../types';

const surfboardRuleTypes = [
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'IP-CIDR',
  'SRC-IP-CIDR',
  'GEOIP',
  'MATCH',
  'FINAL',
  'IP-CIDR6',
  'PROCESS-NAME',
  'IN-PORT',
  'DEST-PORT',
  'SRC-IP',
];

export function surfboardTextRule(
  context: CompileContext,
  rule: Rule,
  ruleset: RuleSet,
  inline: boolean,
  index: number,
): string | undefined {
  if (!supportsRule(context, rule, surfboardRuleTypes, inline, index)) {
    return;
  }

  return iniTextRule(rule, ruleset, inline);
}
