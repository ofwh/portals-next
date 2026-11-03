import { array, number, oneOf, optional, strictShape, text } from '@/lib/subconverter/providers/schema';
import type { Reader } from '@/lib/subconverter/types/providers/schema';
import type { PolicyGroupFields } from './fields-types';
import { policyGroupTypes, policyMemberTypes } from './options';

export const readPolicyGroupFields: Reader<PolicyGroupFields> = strictShape({
  name: text,
  type: oneOf(...policyGroupTypes),
  members: array(strictShape({ type: oneOf(...policyMemberTypes), value: text })),
  providers: array(text),
  url: optional(text),
  interval: optional(number),
  timeout: optional(number),
  tolerance: optional(number),
});
