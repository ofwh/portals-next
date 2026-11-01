import { filterNode } from './filter';
import { parseNode } from './parse';
import { renameNode } from './rename';
import { subscriptionNodesSchema } from './schema';
import type { NodeModuleGroup } from '../types';
import { nodeLabel } from '../utils';

const nodes = [parseNode, renameNode, filterNode] as const;

export const group = {
  id: 'subscription',
  ...nodeLabel('workflowNodes.subscription.group'),
  nodes,
  types: [subscriptionNodesSchema],
} satisfies NodeModuleGroup;

export default nodes;
