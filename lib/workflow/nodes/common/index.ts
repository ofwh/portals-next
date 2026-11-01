import { base64Node } from './base64';
import { fieldInputNode } from './field-input';
import { httpRequestNode } from './http-request';
import { outputSchema } from './http-request/model/schema';
import { mergeNode } from './merge';
import type { NodeModuleGroup } from '../types';
import { nodeLabel } from '../utils';

const nodes = [fieldInputNode, mergeNode, httpRequestNode, base64Node] as const;

export const group = {
  id: 'common',
  ...nodeLabel('workflowNodes.common.group'),
  nodes,
  types: [outputSchema],
} satisfies NodeModuleGroup;

export default nodes;
