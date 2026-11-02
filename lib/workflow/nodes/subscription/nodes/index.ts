import { extractNodesNode } from './extract-nodes';
import { filterNode } from './filter-nodes';
import { renameNode } from './rename-nodes';

export { extractNodesNode, filterNode, renameNode };

const nodes = [extractNodesNode, renameNode, filterNode] as const;

export default nodes;
