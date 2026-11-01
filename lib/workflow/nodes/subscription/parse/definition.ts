import type { ParseConfig, SubscriptionFormat } from './types';
import { nodeLabel } from '../../utils';

export const definition = { type: 'subscription.parse', ...nodeLabel('subscriptionNodes.parse.name'), version: 1 };
export const defaultConfig: ParseConfig = { format: 'auto' };

export const subscriptionFormatLabels = {
  auto: 'auto',
  base64: 'base64',
  links: 'links',
  clash: 'clash',
  'sing-box': 'singBox',
} as const;
export const subscriptionFormats = Object.keys(subscriptionFormatLabels) as SubscriptionFormat[];
