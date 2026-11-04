import type { RuleSetConfigFields } from '@/lib/workflow/nodes/configuration/nodes/rulesets/model/types';
import { fail } from '../shared/errors';
import { boundRules, conditionText, nativeRuleProvider, validateRule } from '../shared/rules';
import type { NativeObject, OutputContext, OutputTarget } from '../types';

export interface RuleProjection {
  rules: string[];
  providers: NativeObject;
}
export const ruleTypes = [
  'MATCH',
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'DOMAIN-REGEX',
  'IP-CIDR',
  'IP-CIDR6',
  'SRC-IP-CIDR',
  'GEOIP',
  'GEOSITE',
  'DST-PORT',
  'SRC-PORT',
  'PROCESS-NAME',
  'PROCESS-PATH',
  'NETWORK',
  'IP-ASN',
  'AND',
  'OR',
  'NOT',
  'RULE-SET',
];

export function transform(
  rules: readonly RuleSetConfigFields[],
  context: OutputContext,
  target: OutputTarget = 'clash',
  allowed: readonly string[] = ruleTypes,
) {
  const providers: NativeObject = {};
  const definitions = rules.map((rule, index): RuleSetConfigFields => {
    if (!nativeRuleProvider(target, rule) || rule.type !== 'remote') {
      return rule;
    }

    let url: URL;

    try {
      url = new URL(rule.url);
    } catch {
      return fail('rule', index, 'url', 'invalid-rule-url');
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
      return fail('rule', index, 'url', 'unsupported-rule-url');
    }

    if (!Number.isSafeInteger(rule.interval) || rule.interval < 0) {
      return fail('rule', index, 'interval', 'invalid-rule-interval');
    }

    const name = `ruleset-${index}`;
    const format = rule.resourceFormat ?? 'yaml';
    const behavior =
      rule.format === 'clash-domain' ? 'domain' : rule.format === 'clash-ipcidr' ? 'ipcidr' : 'classical';

    if (format === 'mrs' && behavior === 'classical') {
      return fail('rule', index, 'resourceFormat', 'unsupported-mrs-behavior');
    }

    providers[name] = {
      type: 'http',
      behavior,
      url: rule.url,
      path: `./rulesets/${name}.${format === 'yaml' ? 'yaml' : format === 'mrs' ? 'mrs' : 'txt'}`,
      interval: rule.interval,
      format,
    };

    return { type: 'inline', rule: `RULE-SET,${name}`, policy: rule.policy, interval: rule.interval };
  });
  const value: RuleProjection = {
    providers,
    rules: boundRules(definitions, context).map(({ condition, policy, index }) => {
      validateRule(condition, allowed, index, true);
      if (condition.type === 'RULE-SET' && !Object.hasOwn(providers, condition.value ?? '')) {
        return fail('rule', index, 'rule', 'unknown-rule-provider');
      }

      return `${conditionText(condition)},${policy}${condition.noResolve ? ',no-resolve' : ''}`;
    }),
  };

  return { value, issues: [] };
}
