import type { ConfigType } from '@/lib/subconverter/types/configuration';
import type { PolicyConfigFields } from '@/lib/subconverter/types/policies';
import type { WorkflowArray, WorkflowDataTypes } from '@/lib/types/workflow';

export interface PolicyGroupsConfig {
  type?: ConfigType;
  client?: string;
}
export type PolicyGroupsInput = WorkflowDataTypes['String'];
export type PolicyGroupsOutput = WorkflowArray<PolicyConfigFields>;
