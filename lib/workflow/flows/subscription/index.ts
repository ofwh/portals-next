import { extractNodesNode } from './extract-nodes-node';
import { filterNode } from './filter-nodes-node';
import { generateSubscriptionNode } from './generate-subscription-node';
import { parseTemplateNode } from './parse-template-node';
import { renameNode } from './rename-nodes-node';
import { schema } from './schema';
import type { NodeModuleGroup } from '../../node/types';
import { nodeLabel } from '../../node/utils';

export { extractNodesNode, parseTemplateNode, filterNode, renameNode, generateSubscriptionNode };

const nodes = [extractNodesNode, parseTemplateNode, renameNode, filterNode, generateSubscriptionNode] as const;

const group = {
  id: 'subscription',
  ...nodeLabel('workflowNodes.subscription.group'),
  nodes,
  types: [schema.proxyNode, ...schema.templates],
} satisfies NodeModuleGroup;

const groups = [group] as const satisfies readonly NodeModuleGroup[];

export default groups;
