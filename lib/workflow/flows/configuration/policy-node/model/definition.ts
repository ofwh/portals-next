import { configFormatOptions } from '@/lib/subscription/shared/config';
import { nodeLabel } from '@/lib/workflow/node/utils';
import type { PolicyResolveConfig } from './types';

export const definition = {
  type: 'policy.resolve',
  ...nodeLabel('workflowNodes.configuration.policy.name'),
  version: 1,
};
export const defaultConfig: PolicyResolveConfig = { format: '', transformer: '' };
export const formatOptions = configFormatOptions;
