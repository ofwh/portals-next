import { appError } from '@/lib/api';
import { assertJson } from '@/lib/shared/data';
import { readPolicyGroupFields } from '@/lib/subconverter/policies/fields';
import type { PolicyGroupFields } from '@/lib/subconverter/types/policies';
import type { NamedType } from '@/lib/types/workflow';
import { arrayOf } from '@/lib/workflow/node/core/schemas';

export const policyGroupSchema: NamedType<PolicyGroupFields> = {
  descriptor: { kind: 'ref', id: 'configuration.policy-groups-fields', version: 1 },
  base: { kind: 'record', values: { kind: 'any' } },
  parse(value) {
    assertJson(value);
    try {
      return readPolicyGroupFields(value);
    } catch {
      throw appError('common.INVALID_PARAMS');
    }
  },
};
export const policyGroupsSchema = arrayOf(policyGroupSchema);
