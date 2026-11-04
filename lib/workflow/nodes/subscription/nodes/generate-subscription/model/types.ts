import type { OutputTarget } from '@/lib/subconverter/output/types';
import type { ProxyNodeFields } from '@/lib/subconverter/types/proxy-node';
import type { PolicyConfigFields } from '@/lib/workflow/nodes/configuration/nodes/policies/model/types';
import type { RuleSetConfigFields } from '@/lib/workflow/nodes/configuration/nodes/rulesets/model/types';

export interface GenerateSubscriptionConfig {
  format: OutputTarget;
}
export type GenerateSubscriptionInput = ProxyNodeFields[] | RuleSetConfigFields[] | PolicyConfigFields[];
export interface GenerateSubscriptionElements {
  nodes?: ProxyNodeFields[];
  rulesets?: RuleSetConfigFields[];
  policies?: PolicyConfigFields[];
}
