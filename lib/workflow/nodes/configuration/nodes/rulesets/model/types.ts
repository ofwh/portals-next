import type { ConfigType } from '@/lib/subconverter/configuration/types';
import type { WorkflowArray, WorkflowDataTypes } from '@/lib/workflow/nodes/types';
import type { RuleGroupFields } from './fields-types';

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

export type RuleSetConfigFields = RuleGroupFields;
