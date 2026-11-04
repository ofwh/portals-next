import type { SubscriptionFormat } from '@/lib/subconverter/types/subscription';
import { nodeLabel } from '@/lib/workflow/node/utils';
import type { ExtractNodesConfig } from './types';

export const definition = {
  type: 'subscription.extract-nodes',
  ...nodeLabel('workflowNodes.subscription.extractNodes.name'),
  version: 1,
};
export const defaultConfig: ExtractNodesConfig = { format: 'clash' };
export const subscriptionFormatLabels = {
  clash: 'clash',
  'sing-box': 'singBox',
  uri: 'uri',
  base64: 'base64',
  ss: 'ss',
  ssr: 'ssr',
  v2ray: 'v2ray',
  ini: 'ini',
  surge: 'surge',
  surfboard: 'surfboard',
  loon: 'loon',
  quanx: 'quanx',
} as const satisfies Record<SubscriptionFormat, string>;
export const subscriptionFormats = Object.keys(subscriptionFormatLabels) as SubscriptionFormat[];
