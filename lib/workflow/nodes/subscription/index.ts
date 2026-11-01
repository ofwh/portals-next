import { contentExtractNode } from './content-extract';
import { outputSchema as extendedNodesSchema } from './content-extract/model/schema';
import { filterNode } from './filter';
import { parseNode } from './parse';
import { renameNode } from './rename';
import { subscriptionNodesSchema } from './schema';
import type { NodeModuleGroup } from '../types';
import { nodeLabel } from '../utils';

const nodes = [parseNode, contentExtractNode, renameNode, filterNode] as const;

export const group = {
  id: 'subscription',
  ...nodeLabel('workflowNodes.subscription.group'),
  nodes,
  types: [subscriptionNodesSchema, extendedNodesSchema],
} satisfies NodeModuleGroup;

export default nodes;
