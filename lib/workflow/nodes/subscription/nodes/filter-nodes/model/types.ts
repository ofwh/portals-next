import type { WorkflowArray, WorkflowDataTypes } from '@/lib/workflow/nodes/types';
import type { SubscriptionNode, SubscriptionProtocol } from '../../../types';

export interface FilterRule {
  id: string;
  pattern: string;
}

export interface FilterConfig {
  protocols: SubscriptionProtocol[];
  namePattern: string | FilterRule[];
  exclude: boolean;
}
export type FilterInput = WorkflowDataTypes['Array'];
export type FilterRunInput = WorkflowArray<SubscriptionNode>;
export type FilterOutput = WorkflowArray<SubscriptionNode>;
