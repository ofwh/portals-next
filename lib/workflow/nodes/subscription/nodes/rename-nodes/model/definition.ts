import { nodeLabel } from '@/lib/workflow/nodes/utils';
import type { RenameConfig } from './types';

export const definition = {
  type: 'subscription.rename',
  ...nodeLabel('workflowNodes.subscription.rename.name'),
  version: 1,
};
export const defaultConfig: RenameConfig = { rules: [] };
