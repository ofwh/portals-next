import { nodeLabel } from '@/lib/workflow/node/utils';
import type { RuleGroupsConfig } from './types';

export const definition = {
  type: 'configuration.rule-groups',
  ...nodeLabel('workflowNodes.configuration.ruleGroups.name'),
  version: 1,
};
export const defaultConfig: RuleGroupsConfig = { type: 'ini' };
