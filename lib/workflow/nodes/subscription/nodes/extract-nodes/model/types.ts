import type { ProxyNodeFields } from '@/lib/subconverter/types';
import type { WorkflowArray, WorkflowDataTypes } from '@/lib/workflow/nodes/types';
import type { SubscriptionFormat } from '../../../types';

export type { SubscriptionFormat } from '../../../types';
export interface ExtractNodesConfig {
  format: SubscriptionFormat;
}
export type ExtractNodesInput = WorkflowDataTypes['String'];
export type ExtractNodesOutput = WorkflowArray<ProxyNodeFields>;
