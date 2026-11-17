import { configDeclarationType } from '@/lib/subscription/config/schema';
import { templateType } from '@/lib/subscription/template/schema';
import type { NodeModuleGroup } from '@/lib/workflow/node/types';
import { nodeLabel } from '@/lib/workflow/node/utils';
import { compileNode } from './compile-node';
import { configResolveNode } from './config-node';
import { templateResolveNode } from './template-node';

const groups = [
  {
    id: 'configuration',
    ...nodeLabel('workflowNodes.groups.configuration'),
    nodes: [configResolveNode, templateResolveNode, compileNode],
    types: [configDeclarationType, templateType],
  },
] as const satisfies readonly NodeModuleGroup[];

export default groups;
