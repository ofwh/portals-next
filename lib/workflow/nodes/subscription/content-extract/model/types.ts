import type { ParsedProxyNode } from '@/lib/types/subscriptions/nodes';

export type SubscriptionFormat = 'clash' | 'loon' | 'links' | 'base64' | 'sing-box';
export interface ContentExtractConfig {
  format: SubscriptionFormat;
}
export type ContentExtractOutput = ParsedProxyNode[];
