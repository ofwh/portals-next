import type { ProxyNode } from '@/lib/subscription/types/proxy-node';
import type { WorkflowArray } from '@/lib/types/workflow';

export interface RenameRule {
  id: string;
  pattern: string;
  replacement: string;
}
export interface RenameConfig {
  rules: RenameRule[];
}
export type RenameInput = WorkflowArray<ProxyNode>;
export type RenameRunInput = WorkflowArray<ProxyNode>;
export type RenameOutput = WorkflowArray<ProxyNode>;
