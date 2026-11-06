import logger from '@/lib/api/logger';
import type { RuleSetConfigFields } from '@/lib/subconverter/types/rulesets';
import type { NativeObject, OutputContext, OutputTarget } from '../../types/output';
import { fail, OUTPUT_ERROR } from '../shared/errors';
import { boundRules, conditionText, nativeRuleProvider, validateRule } from '../shared/rules';

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
      logger.warn(OUTPUT_ERROR.INVALID_RULE_URL, { data: rule, field: 'url' });

      return fail('rule', index, 'url', OUTPUT_ERROR.INVALID_RULE_URL);
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
      logger.warn(OUTPUT_ERROR.UNSUPPORTED_RULE_URL, { data: rule, field: 'url' });

      return fail('rule', index, 'url', OUTPUT_ERROR.UNSUPPORTED_RULE_URL);
    }

    if (!Number.isSafeInteger(rule.interval) || rule.interval < 0) {
      logger.warn(OUTPUT_ERROR.INVALID_RULE_INTERVAL, { data: rule, field: 'interval' });

      return fail('rule', index, 'interval', OUTPUT_ERROR.INVALID_RULE_INTERVAL);
    }

    const name = `ruleset-${index}`;
    const format = rule.resourceFormat ?? 'yaml';
    const behavior =
      rule.format === 'clash-domain' ? 'domain' : rule.format === 'clash-ipcidr' ? 'ipcidr' : 'classical';

    if (format === 'mrs' && behavior === 'classical') {
      logger.warn(OUTPUT_ERROR.UNSUPPORTED_MRS_BEHAVIOR, { data: rule, field: 'resourceFormat' });

      return fail('rule', index, 'resourceFormat', OUTPUT_ERROR.UNSUPPORTED_MRS_BEHAVIOR);
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
        logger.warn(OUTPUT_ERROR.UNKNOWN_RULE_PROVIDER, { data: rules[index], field: 'rule' });

        return fail('rule', index, 'rule', OUTPUT_ERROR.UNKNOWN_RULE_PROVIDER);
      }

      return `${conditionText(condition)},${policy}${condition.noResolve ? ',no-resolve' : ''}`;
    }),
  };

  return { value, issues: [] };
}
