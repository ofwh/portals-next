import type { PolicyGroupMember, PolicyGroupType } from '@/lib/subconverter/types/policies';

export const policyGroupTypes = [
  'select',
  'url-test',
  'fallback',
  'load-balance',
  'relay',
  'ssid',
  'smart',
] as const satisfies readonly PolicyGroupType[];
export const policyMemberTypes = ['reference', 'selector'] as const satisfies readonly PolicyGroupMember['type'][];
export const timedPolicyGroupTypes: readonly PolicyGroupType[] = ['url-test', 'fallback', 'load-balance', 'smart'];
