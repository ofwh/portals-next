import type { SubscriptionTemplateFormat } from '@/lib/subconverter/types/template';
import { nodeLabel } from '@/lib/workflow/node/utils';
import type { ParseTemplateConfig } from './types';

export const definition = {
  type: 'subscription.parse-template',
  ...nodeLabel('workflowNodes.subscription.parseTemplate.name'),
  version: 1,
};
export const defaultConfig: ParseTemplateConfig = { format: 'clash' };
export const templateFormatLabels = {
  clash: 'Clash',
  surge: 'Surge',
  surfboard: 'Surfboard',
  quanx: 'Quantumult X',
  loon: 'Loon',
  sssub: 'SSSub (SIP008)',
  singbox: 'sing-box',
  stash: 'Stash',
} as const satisfies Record<SubscriptionTemplateFormat, string>;

export { templateFormats } from '@/lib/subconverter/template/formats';
