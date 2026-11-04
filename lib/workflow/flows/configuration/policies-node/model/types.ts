import type { ConfigType } from '@/lib/subconverter/types/configuration';
import type { PolicyConfigFields } from '@/lib/subconverter/types/policies';
import type { WorkflowArray, WorkflowDataTypes } from '@/lib/types/workflow';

export interface PolicyGroupsConfig {
  type?: ConfigType;
}
export type PolicyGroupsInput = WorkflowDataTypes['String'];
export type PolicyGroupsOutput = WorkflowArray<PolicyConfigFields>;

export interface PolicyConfigNode {
  name: string;
  type: string;
  rule?: readonly string[];
  use?: readonly string[];
  url?: string;
  interval?: string;
  timeout?: string;
  tolerance?: string;
}
