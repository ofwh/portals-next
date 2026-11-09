import { parseRuleContent } from '../../../ruleset/content';
import type { Rule, RuleSet } from '../../../types/ruleset';
import { CompileError, warn } from '../../diagnostics';
import type { CompileContext } from '../../types';

const basic = ['DOMAIN', 'DOMAIN-SUFFIX', 'DOMAIN-KEYWORD', 'IP-CIDR', 'SRC-IP-CIDR', 'GEOIP', 'MATCH', 'FINAL'];
const clash = [
  ...basic,
  'IP-CIDR6',
  'SRC-PORT',
  'DST-PORT',
  'PROCESS-NAME',
  'DOMAIN-REGEX',
  'GEOSITE',
  'IP-SUFFIX',
  'IP-ASN',
  'SRC-GEOIP',
  'SRC-IP-ASN',
  'SRC-IP-SUFFIX',
  'IN-PORT',
  'IN-TYPE',
  'IN-USER',
  'IN-NAME',
  'PROCESS-PATH-REGEX',
  'PROCESS-PATH',
  'PROCESS-NAME-REGEX',
  'UID',
  'NETWORK',
  'DSCP',
  'SUB-RULE',
  'RULE-SET',
  'AND',
  'OR',
  'NOT',
];
const surge = [...basic, 'IP-CIDR6', 'USER-AGENT', 'URL-REGEX', 'PROCESS-NAME', 'IN-PORT', 'DEST-PORT', 'SRC-IP'];
const surfboard = [...basic, 'IP-CIDR6', 'PROCESS-NAME', 'IN-PORT', 'DEST-PORT', 'SRC-IP'];
const quanx = [...basic, 'USER-AGENT', 'HOST', 'HOST-SUFFIX', 'HOST-KEYWORD'];

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

export function textRule(
  context: CompileContext,
  rule: Rule,
  ruleset: RuleSet,
  inline: boolean,
  index: number,
): string | undefined {
  const target = context.target;
  const supported =
    target === 'clash'
      ? clash
      : target === 'quanx'
        ? quanx
        : target === 'surfboard'
          ? surfboard
          : target === 'surge'
            ? [...surge, 'AND', 'OR', 'NOT']
            : surge;

  if (!inline && !supported.some((type) => rule.type.startsWith(type))) {
    warn(context, 'UNSUPPORTED_RULE', 'rulesets', index);

    return;
  }

  const final = rule.type === 'MATCH' || rule.type === 'FINAL';

  if (target === 'clash') {
    if (final) {
      return `MATCH,${ruleset.group}`;
    }

    if (
      ['AND', 'OR', 'NOT', 'SUB-RULE', 'DOMAIN-REGEX', 'PROCESS-NAME-REGEX', 'PROCESS-PATH-REGEX'].includes(rule.type)
    ) {
      return [rule.type, ...rule.parameters, ...rule.flags, ruleset.group].join(',');
    }

    const flags = rule.flags.slice(0, 1);

    if (
      !inline &&
      ruleset.options.noResolve &&
      ruleset.category === 'clash-ipcidr' &&
      ['IP-CIDR', 'IP-CIDR6'].includes(rule.type) &&
      !flags.includes('no-resolve')
    ) {
      flags.push('no-resolve');
    }

    return [rule.type, ...rule.parameters, ruleset.group, ...flags].join(',');
  }

  if (['AND', 'OR', 'NOT'].includes(rule.type) && target !== 'quanx') {
    return [rule.type, ...rule.parameters, ...rule.flags].join(',');
  }

  const type = final
    ? inline
      ? 'FINAL'
      : rule.type
    : target === 'quanx' && rule.type === 'IP-CIDR6'
      ? 'IP6-CIDR'
      : rule.type;
  const flags =
    target === 'quanx' ? rule.flags.filter((flag) => flag === 'no-resolve').slice(0, 1) : rule.flags.slice(0, 1);

  return [type, ...rule.parameters, ruleset.group, ...flags].join(',');
}
