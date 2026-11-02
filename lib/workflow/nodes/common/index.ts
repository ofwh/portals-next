import nodes from './nodes';
import type { NodeModuleGroup } from '../types';
import { nodeLabel } from '../utils';

const group = {
  id: 'common',
  ...nodeLabel('workflowNodes.common.group'),
  nodes,
} satisfies NodeModuleGroup;

const groups = [group] as const satisfies readonly NodeModuleGroup[];

export default groups;
