import { ruleTypes } from '@/lib/subconverter/rulesets/output/surfboard';
import { parseRules, validateInlineRule, validateRuleOptions } from '@/lib/subconverter/rulesets/shared/parser';
import type { ConfigObject } from '@/lib/subconverter/types/configuration';
import type { RuleSetConfigFields } from '@/lib/subconverter/types/rulesets';

export function parse(configuration: ConfigObject): RuleSetConfigFields[] {
  return parseRules(configuration).map((rule) => {
    validateRuleOptions(rule, ['no-resolve']);
    validateInlineRule(rule, ruleTypes, false);

    return rule;
  });
}
