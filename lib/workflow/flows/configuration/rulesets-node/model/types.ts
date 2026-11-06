import type { ConfigType } from '@/lib/subconverter/types/configuration';
import type { RuleSetConfigFields } from '@/lib/subconverter/types/rulesets';
import type { WorkflowArray, WorkflowDataTypes } from '@/lib/types/workflow';

export interface RuleGroupsConfig {
  type?: ConfigType;
  client?: string;
}
export type RuleGroupsInput = WorkflowDataTypes['String'];
export type RuleGroupsOutput = WorkflowArray<RuleSetConfigFields>;
