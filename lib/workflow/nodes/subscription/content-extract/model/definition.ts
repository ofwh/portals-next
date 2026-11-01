import type { ContentExtractConfig } from './types';
import { nodeLabel } from '../../../utils';

export const definition = {
  type: 'subscription.content-extract',
  version: 1,
  ...nodeLabel('workflowNodes.subscription.contentExtract.name'),
};
export const defaultConfig: ContentExtractConfig = { format: 'clash' };
export const formats = ['clash', 'loon', 'links', 'base64', 'sing-box'] as const;
