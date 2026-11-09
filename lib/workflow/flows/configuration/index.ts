import { proxyGroupType } from '@/lib/subscription/schemas/policy';
import { ruleSetType } from '@/lib/subscription/schemas/ruleset';
import { templateType } from '@/lib/subscription/schemas/template';
import type { NodeModuleGroup } from '@/lib/workflow/node/types';
import { nodeLabel } from '@/lib/workflow/node/utils';
import { compileNode } from './compile-node';
import { policyResolveNode } from './policy-node';
import { rulesetResolveNode } from './ruleset-node';
import { templateResolveNode } from './template-node';

const groups = [
  {
    id: 'configuration',
    ...nodeLabel('workflowNodes.groups.configuration'),
    nodes: [rulesetResolveNode, policyResolveNode, templateResolveNode, compileNode],
    types: [ruleSetType, proxyGroupType, templateType],
  },
] as const satisfies readonly NodeModuleGroup[];

export default groups;
