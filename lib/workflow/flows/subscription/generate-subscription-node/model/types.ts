import type { OutputTarget } from '@/lib/subconverter/types/output';
import type { PolicyConfigFields } from '@/lib/subconverter/types/policies';
import type { ProxyNodeFields } from '@/lib/subconverter/types/proxy-node';
import type { RuleSetConfigFields } from '@/lib/subconverter/types/rulesets';

export interface GenerateSubscriptionConfig {
  format: OutputTarget;
}
export type GenerateSubscriptionInput = ProxyNodeFields[] | RuleSetConfigFields[] | PolicyConfigFields[];
export interface GenerateSubscriptionElements {
  nodes?: ProxyNodeFields[];
  rulesets?: RuleSetConfigFields[];
  policies?: PolicyConfigFields[];
}
