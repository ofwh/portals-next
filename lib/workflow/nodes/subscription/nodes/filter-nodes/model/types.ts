import type { ProxyNodeFields, ProxyType } from '@/lib/subconverter/types';
import type { WorkflowArray } from '@/lib/workflow/nodes/types';

export interface FilterRule {
  id: string;
  pattern: string;
}

export interface FilterConfig {
  protocols: ProxyType[];
  namePattern: string | FilterRule[];
  exclude: boolean;
}
export type FilterInput = WorkflowArray<ProxyNodeFields>;
export type FilterRunInput = WorkflowArray<ProxyNodeFields>;
export type FilterOutput = WorkflowArray<ProxyNodeFields>;
