import { boolean, number, oneOf, optional, strictShape, tagged, text } from '@/lib/subconverter/providers/schema';
import type { Reader } from '@/lib/subconverter/types/providers/schema';
import type { RuleGroupFields } from './fields-types';
import { ruleResourceFormats, ruleSourceFormats } from './options';

export const readRuleGroupFields: Reader<RuleGroupFields> = tagged('type', {
  inline: strictShape({ type: oneOf('inline'), policy: text, interval: number, rule: text }),
  remote: strictShape({
    type: oneOf('remote'),
    policy: text,
    interval: number,
    url: text,
    format: oneOf(...ruleSourceFormats),
    noResolve: boolean,
    resourceFormat: optional(oneOf(...ruleResourceFormats)),
  }),
});
