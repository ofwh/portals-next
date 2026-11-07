import { fieldInputNode } from './field-input-node';
import { httpRequestNode } from './http-request-node';
import { httpResponseHeadersNode } from './http-response-headers-node';
import { mergeNode } from './merge-node';
import type { NodeModuleGroup } from '../../node/types';
import { nodeLabel } from '../../node/utils';

export { fieldInputNode, httpRequestNode, mergeNode, httpResponseHeadersNode };

const nodes = [fieldInputNode, mergeNode, httpRequestNode, httpResponseHeadersNode] as const;

const group = {
  id: 'common',
  ...nodeLabel('workflowNodes.groups.common'),
  nodes,
} satisfies NodeModuleGroup;

const groups = [group] as const satisfies readonly NodeModuleGroup[];

export default groups;

export { messages, errorMessages } from './messages';
