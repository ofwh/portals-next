import { proxyGroupType } from '@/lib/subscription/schemas/policy';
import { ruleSetType } from '@/lib/subscription/schemas/ruleset';
import type { NodeModuleGroup } from '@/lib/workflow/node/types';
import { nodeLabel } from '@/lib/workflow/node/utils';
import { policyResolveNode } from './policy-node';
import { rulesetResolveNode } from './ruleset-node';

const groups = [
  {
    id: 'configuration',
    ...nodeLabel('workflowNodes.groups.configuration'),
    nodes: [rulesetResolveNode, policyResolveNode],
    types: [ruleSetType, proxyGroupType],
  },
] as const satisfies readonly NodeModuleGroup[];

export default groups;
