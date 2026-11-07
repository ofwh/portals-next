import type { ProxyNode, ProxyProtocol } from '@/lib/subscription/types/proxy-node';
import type { WorkflowArray } from '@/lib/types/workflow';

export interface FilterRule {
  id: string;
  pattern: string;
}

export interface FilterConfig {
  protocols: ProxyProtocol[];
  namePattern: string | FilterRule[];
  exclude: boolean;
}
export type FilterInput = WorkflowArray<ProxyNode>;
export type FilterRunInput = WorkflowArray<ProxyNode>;
export type FilterOutput = WorkflowArray<ProxyNode>;
