import { httpRequestNode } from './http-request';
import { outputSchema } from './http-request/schema';
import { mergeNode } from './merge';
import { textareaNode } from './textarea';
import type { NodeModuleGroup } from '../types';
import { nodeLabel } from '../utils';

const nodes = [textareaNode, mergeNode, httpRequestNode] as const;

export const group = {
  id: 'common',
  ...nodeLabel('commonNodes.group'),
  nodes,
  types: [outputSchema],
} satisfies NodeModuleGroup;

export default nodes;
