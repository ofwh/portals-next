import { extractNodesNodeView } from './extract-nodes/client';
import { isConfig as isExtractNodesConfig } from './extract-nodes/model/schema';
import { filterNodeView } from './filter-nodes/client';
import { isConfig as isFilterConfig } from './filter-nodes/model/schema';
import { renameNodeView } from './rename-nodes/client';
import { isConfig as isRenameConfig } from './rename-nodes/model/schema';
import type { NodeViewRegistry } from '../../core/views';

export const nodeViews = [extractNodesNodeView, renameNodeView, filterNodeView] as const;

export function registerNodeViews(views: NodeViewRegistry): void {
  views.registerNodeView(extractNodesNodeView, isExtractNodesConfig);
  views.registerNodeView(renameNodeView, isRenameConfig);
  views.registerNodeView(filterNodeView, isFilterConfig);
}
