import type { subscriptionFormatLabels } from './definition';
import type { HttpRequestOutput } from '../../common/http-request/types';
import type { SubscriptionNode } from '../types';

export interface ClashProxy {
  name: string;
  type: string;
  server: string;
  port: number;
  [key: string]: unknown;
}

export type SubscriptionFormat = keyof typeof subscriptionFormatLabels;

export interface ParseConfig {
  format: SubscriptionFormat;
}
export type ParseInput = string | HttpRequestOutput | Record<string, unknown>;
export type ParseOutput = SubscriptionNode[];

export interface FormatParser {
  matches(content: string): boolean;
  extract(content: string): unknown[];
}
