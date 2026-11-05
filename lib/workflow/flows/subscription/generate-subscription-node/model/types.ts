import type { OutputTarget } from '@/lib/subconverter/types/output';
import type { PolicyConfigFields } from '@/lib/subconverter/types/policies';
import type { ProxyNodeFields } from '@/lib/subconverter/types/proxy-node';
import type { RuleSetConfigFields } from '@/lib/subconverter/types/rulesets';
import type { SubscriptionTemplate } from '@/lib/subconverter/types/template';

export interface GenerateSubscriptionConfig {
  format: OutputTarget;
}
export type GenerateSubscriptionInput =
  ProxyNodeFields[] | RuleSetConfigFields[] | PolicyConfigFields[] | SubscriptionTemplate;
export interface GenerateSubscriptionElements {
  template?: SubscriptionTemplate;
  nodes?: ProxyNodeFields[];
  rulesets?: RuleSetConfigFields[];
  policies?: PolicyConfigFields[];
}
