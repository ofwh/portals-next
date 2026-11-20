import { nodeLabel } from '@/lib/workflow/node/utils';
import type { ConfigResolveConfig } from './types';

export const definition = {
  type: 'config.resolve',
  ...nodeLabel('workflowNodes.configuration.config.name'),
  version: 1,
};
export const defaultConfig: ConfigResolveConfig = {};
