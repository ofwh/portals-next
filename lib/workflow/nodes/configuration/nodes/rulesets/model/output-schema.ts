import { appError } from '@/lib/api';
import { arrayOf } from '@/lib/workflow/nodes/core/schemas';
import type { NamedType } from '@/lib/workflow/nodes/types';
import { assertJson } from '@/lib/workflow/utils';
import { readRuleGroupFields } from './fields';
import type { RuleGroupFields } from './fields-types';

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
