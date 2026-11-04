import { appError } from '@/lib/api';
import { assertJson } from '@/lib/shared/data';
import { arrayOf } from '@/lib/workflow/nodes/core/schemas';
import type { NamedType } from '@/lib/workflow/nodes/types';
import { readPolicyGroupFields } from './fields';
import type { PolicyGroupFields } from './fields-types';

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
