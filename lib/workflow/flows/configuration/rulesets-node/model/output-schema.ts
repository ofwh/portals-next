import { appError } from '@/lib/api';
import { assertJson } from '@/lib/shared/data';
import { readRuleGroupFields } from '@/lib/subconverter/rulesets/fields';
import type { RuleGroupFields } from '@/lib/subconverter/types/rulesets';
import type { NamedType } from '@/lib/types/workflow';
import { arrayOf } from '@/lib/workflow/node/core/schemas';

export const ruleGroupSchema: NamedType<RuleGroupFields> = {
  descriptor: { kind: 'ref', id: 'configuration.rule-groups-fields', version: 1 },
  base: { kind: 'record', values: { kind: 'any' } },
  parse(value) {
    assertJson(value);
    try {
      return readRuleGroupFields(value);
    } catch {
      throw appError('common.INVALID_PARAMS');
    }
  },
};
export const ruleGroupsSchema = arrayOf(ruleGroupSchema);
