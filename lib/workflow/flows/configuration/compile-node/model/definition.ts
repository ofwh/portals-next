import { nodeLabel } from '@/lib/workflow/node/utils';
import type { CompileNodeConfig } from './types';

export const definition = {
  type: 'subscription.compile',
  ...nodeLabel('workflowNodes.configuration.compile.name'),
  version: 1,
};
export const defaultConfig: CompileNodeConfig = { target: '' };
