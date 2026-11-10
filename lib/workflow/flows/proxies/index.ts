import { proxyNodeType } from '@/lib/subscription/schemas/proxy-node';
import type { NodeModuleGroup } from '@/lib/workflow/node/types';
import { nodeLabel } from '@/lib/workflow/node/utils';
import { filterNode } from './filter-node';
import { mergeNode } from './merge-node';
import { renameNode } from './rename-node';
import { proxyListNode } from './resolve-node';

const groups = [
  {
    id: 'proxy',
    ...nodeLabel('workflowNodes.groups.proxy'),
    nodes: [proxyListNode, mergeNode, renameNode, filterNode],
    types: [proxyNodeType],
  },
] as const satisfies readonly NodeModuleGroup[];

export default groups;

export { messages } from './messages';
