import { proxyNodeType } from '@/lib/subscription/node/schema';
import type { NodeModuleGroup } from '@/lib/workflow/node/types';
import { nodeLabel } from '@/lib/workflow/node/utils';
import { filterNode } from './filter-node';
import { mergeNode } from './merge-node';
import { renameNode } from './rename-node';
import { proxyListNode } from './resolve-node';
import { routeNode } from './route-node';

const groups = [
  {
    id: 'proxy',
    ...nodeLabel('workflowNodes.groups.proxy'),
    nodes: [routeNode, proxyListNode, mergeNode, renameNode, filterNode],
    types: [proxyNodeType],
  },
] as const satisfies readonly NodeModuleGroup[];

export default groups;

export { messages } from './messages';
