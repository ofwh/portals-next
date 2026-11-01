import type { SubscriptionNode } from '../../types';

export interface RenameRule {
  id: string;
  pattern: string;
  replacement: string;
}
export interface RenameConfig {
  rules: RenameRule[];
}
export type RenameInput = unknown[];
export type RenameRunInput = SubscriptionNode[];
export type RenameOutput = SubscriptionNode[];
