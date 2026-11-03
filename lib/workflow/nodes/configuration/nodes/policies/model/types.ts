import type { ConfigType } from '@/lib/subconverter/configuration/types';
import type { WorkflowArray, WorkflowDataTypes } from '@/lib/workflow/nodes/types';
import type { PolicyGroupFields } from './fields-types';

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

export type PolicyConfigFields = PolicyGroupFields;
