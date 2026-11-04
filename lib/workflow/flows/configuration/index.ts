import { policyGroupsNode } from './policies-node';
import { policyGroupSchema } from './policies-node/model/output-schema';
import { ruleGroupsNode } from './rulesets-node';
import { ruleGroupSchema } from './rulesets-node/model/output-schema';
import type { NodeModuleGroup } from '../../node/types';
import { nodeLabel } from '../../node/utils';

export { ruleGroupsNode, policyGroupsNode };

const nodes = [ruleGroupsNode, policyGroupsNode] as const;

const groups = [
  {
    id: 'configuration',
    ...nodeLabel('workflowNodes.configuration.group'),
    nodes,
    types: [ruleGroupSchema, policyGroupSchema],
  },
] as const satisfies readonly NodeModuleGroup[];

export default groups;
