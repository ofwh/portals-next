import type { SubscriptionNode, SubscriptionProtocol } from '../../types';

export interface FilterRule {
  id: string;
  pattern: string;
}

export interface FilterConfig {
  protocols: SubscriptionProtocol[];
  namePattern: string | FilterRule[];
  exclude: boolean;
}
export type FilterInput = unknown[];
export type FilterRunInput = SubscriptionNode[];
export type FilterOutput = SubscriptionNode[];
