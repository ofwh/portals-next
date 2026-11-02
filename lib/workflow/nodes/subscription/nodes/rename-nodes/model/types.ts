import type { WorkflowArray, WorkflowDataTypes } from '@/lib/workflow/nodes/types';
import type { SubscriptionNode } from '../../../types';

export interface RenameRule {
  id: string;
  pattern: string;
  replacement: string;
}
export interface RenameConfig {
  rules: RenameRule[];
}
export type RenameInput = WorkflowDataTypes['Array'];
export type RenameRunInput = WorkflowArray<SubscriptionNode>;
export type RenameOutput = WorkflowArray<SubscriptionNode>;
