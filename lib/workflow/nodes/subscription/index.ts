import nodes from './nodes';
import { proxyNodeSchema } from './proxy-node-schema';
import { subscriptionNodesSchema } from './schema';
import type { NodeModuleGroup } from '../types';
import { nodeLabel } from '../utils';

const group = {
  id: 'subscription',
  ...nodeLabel('workflowNodes.subscription.group'),
  nodes,
  types: [subscriptionNodesSchema, proxyNodeSchema],
} satisfies NodeModuleGroup;

const groups = [group] as const satisfies readonly NodeModuleGroup[];

export default groups;
