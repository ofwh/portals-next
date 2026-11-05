import type { IniRuleProjection } from './types';
import type { OutputContext } from '../../../types/output';
import type { RuleSetConfigFields } from '../../../types/rulesets';
import { boundRules, conditionText, validateRule } from '../rules';

export const basicRuleTypes = [
  'MATCH',
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'IP-CIDR',
  'IP-CIDR6',
  'SRC-IP-CIDR',
  'GEOIP',
];

export function projectRules(
  rules: readonly RuleSetConfigFields[],
  context: OutputContext,
  allowed: readonly string[],
  rename: Readonly<Record<string, string>> = {},
  lower = false,
) {
  const local = boundRules(rules, context).map(({ condition, policy, index }) => {
    validateRule(condition, allowed, index);
    let line = conditionText(condition, 'FINAL', rename);

    if (lower) {
      const comma = line.indexOf(',');

      line = comma === -1 ? line.toLowerCase() : line.slice(0, comma).toLowerCase() + line.slice(comma);
    }

    return `${line},${policy}`;
  });
  const value: IniRuleProjection = { local, remote: [] };

  return { value, issues: [] };
}
