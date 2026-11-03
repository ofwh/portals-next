import { nodeLabel } from '@/lib/workflow/nodes/utils';
import type { PolicyGroupsConfig } from './types';

export const definition = {
  type: 'configuration.policy-groups',
  ...nodeLabel('workflowNodes.configuration.policyGroups.name'),
  version: 1,
};
export const defaultConfig: PolicyGroupsConfig = { type: 'ini' };
