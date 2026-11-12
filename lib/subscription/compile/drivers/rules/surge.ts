import { iniTextRule, supportsRule } from './shared';
import type { Rule, RuleSet } from '../../../types/ruleset';
import type { CompileContext } from '../../types';

const surgeRuleTypes = [
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'IP-CIDR',
  'SRC-IP-CIDR',
  'GEOIP',
  'MATCH',
  'FINAL',
  'IP-CIDR6',
  'USER-AGENT',
  'URL-REGEX',
  'PROCESS-NAME',
  'IN-PORT',
  'DEST-PORT',
  'SRC-IP',
  'AND',
  'OR',
  'NOT',
];

export function surgeTextRule(
  context: CompileContext,
  rule: Rule,
  ruleset: RuleSet,
  inline: boolean,
  index: number,
): string | undefined {
  if (!supportsRule(context, rule, surgeRuleTypes, inline, index)) {
    return;
  }

  return iniTextRule(rule, ruleset, inline);
}
