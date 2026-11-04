import type { ProxyNodeFields } from '@/lib/subconverter/types';
import type { SubscriptionFormat } from '@/lib/subconverter/types/subscription';
import type { WorkflowArray, WorkflowDataTypes } from '@/lib/types/workflow';

export interface ExtractNodesConfig {
  format: SubscriptionFormat;
}
export type ExtractNodesInput = WorkflowDataTypes['String'];
export type ExtractNodesOutput = WorkflowArray<ProxyNodeFields>;
