import { templateFormatOptions } from '@/lib/subscription/shared/template';
import { nodeLabel } from '@/lib/workflow/node/utils';
import type { TemplateResolveConfig } from './types';

export const definition = {
  type: 'template.resolve',
  ...nodeLabel('workflowNodes.configuration.template.name'),
  version: 1,
};
export const defaultConfig: TemplateResolveConfig = { format: '' };
export const formatOptions = templateFormatOptions;
