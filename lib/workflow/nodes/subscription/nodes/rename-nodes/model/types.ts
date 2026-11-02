import type { ProxyNodeFields } from '@/lib/subconverter/types';
import type { WorkflowArray } from '@/lib/workflow/nodes/types';

export interface RenameRule {
  id: string;
  pattern: string;
  replacement: string;
}
export interface RenameConfig {
  rules: RenameRule[];
}
export type RenameInput = WorkflowArray<ProxyNodeFields>;
export type RenameRunInput = WorkflowArray<ProxyNodeFields>;
export type RenameOutput = WorkflowArray<ProxyNodeFields>;
