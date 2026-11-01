import type { subscriptionFormatLabels } from './definition';
import type { HttpRequestOutput } from '../../../common/http-request/model/types';
import type { SubscriptionNode } from '../../types';

export type SubscriptionFormat = keyof typeof subscriptionFormatLabels;

export interface ParseConfig {
  format: SubscriptionFormat;
}
export type ParseInput = string | HttpRequestOutput | Record<string, unknown>;
export type ParseOutput = SubscriptionNode[];
