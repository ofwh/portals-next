import { supportsRule } from './shared';
import { normalizeQuanxRuleFlag } from '../../../ruleset/resolvers/quanx';
import type { Rule, RuleSet } from '../../../types/ruleset';
import { warn } from '../../diagnostics';
import type { CompileContext } from '../../types';

const quanxRuleTypes = [
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'DOMAIN-WILDCARD',
  'IP-CIDR',
  'IP-CIDR6',
  'SRC-IP-CIDR',
  'GEOIP',
  'FINAL',
  'IP-ASN',
  'USER-AGENT',
  'HOST',
  'HOST-SUFFIX',
  'HOST-KEYWORD',
  'HOST-WILDCARD',
];

const quanxOutputTypes: Record<string, string> = {
  DOMAIN: 'HOST',
  'DOMAIN-SUFFIX': 'HOST-SUFFIX',
  'DOMAIN-KEYWORD': 'HOST-KEYWORD',
  'DOMAIN-WILDCARD': 'HOST-WILDCARD',
  'IP-CIDR6': 'IP6-CIDR',
};

export function quanxTextRule(
  context: CompileContext,
  rule: Rule,
  ruleset: RuleSet,
  inline: boolean,
  index: number,
): string | undefined {
  if (rule.type === 'MATCH') {
    warn(context, 'UNSUPPORTED_RULE', 'rulesets', index);

    return;
  }

  if (!supportsRule(context, rule, quanxRuleTypes, inline, index, true)) {
    return;
  }

  const type = quanxOutputTypes[rule.type] ?? rule.type;
  const flags = rule.flags.flatMap((flag) => {
    const normalized = normalizeQuanxRuleFlag(flag);

    return normalized === undefined ? [] : [normalized];
  });

  return [type, ...rule.parameters, ruleset.group, ...flags].join(',');
}
