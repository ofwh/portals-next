import type { ConfigType } from '@/lib/subconverter/types/configuration';
import type { RuleSetConfigFields } from '@/lib/subconverter/types/rulesets';
import type { WorkflowArray, WorkflowDataTypes } from '@/lib/types/workflow';

export interface RuleGroupsConfig {
  type?: ConfigType;
}
export type RuleGroupsInput = WorkflowDataTypes['String'];
export type RuleGroupsOutput = WorkflowArray<RuleSetConfigFields>;

export interface RuleSetConfigNode {
  group: string;
  rule?: string;
  ruleset?: string;
  type?: string;
  interval?: string;
  options?: readonly string[];
}
