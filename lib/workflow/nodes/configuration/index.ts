import nodes from './nodes';
import { policyGroupSchema } from './nodes/policies/model/output-schema';
import { ruleGroupSchema } from './nodes/rulesets/model/output-schema';
import type { NodeModuleGroup } from '../types';
import { nodeLabel } from '../utils';

const groups = [
  {
    id: 'configuration',
    ...nodeLabel('workflowNodes.configuration.group'),
    nodes,
    types: [ruleGroupSchema, policyGroupSchema],
  },
] as const satisfies readonly NodeModuleGroup[];

export default groups;
