import type { OutputTarget } from '@/lib/subconverter/output/types';
import { nodeLabel } from '@/lib/workflow/nodes/utils';
import type { GenerateSubscriptionConfig } from './types';

export const definition = {
  type: 'subscription.generate-subscription',
  ...nodeLabel('workflowNodes.subscription.generateSubscription.name'),
  version: 1,
};
export const defaultConfig: GenerateSubscriptionConfig = { format: 'clash' };
export const outputFormats = [
  'clash',
  'clashr',
  'surge',
  'quanx',
  'loon',
  'surfboard',
  'stash',
  'singbox',
] as const satisfies readonly OutputTarget[];
export const outputFormatLabels: Record<OutputTarget, string> = {
  clash: 'Clash / Mihomo',
  clashr: 'ClashR',
  surge: 'Surge',
  quanx: 'Quantumult X',
  loon: 'Loon',
  surfboard: 'Surfboard',
  stash: 'Stash',
  singbox: 'sing-box',
};
