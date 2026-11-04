import { extractNodesNodeView } from './extract-nodes-node/client';
import { isConfig as isExtractNodesConfig } from './extract-nodes-node/model/schema';
import { filterNodeView } from './filter-nodes-node/client';
import { isConfig as isFilterConfig } from './filter-nodes-node/model/schema';
import { generateSubscriptionNodeView } from './generate-subscription-node/client';
import { isConfig as isGenerateSubscriptionConfig } from './generate-subscription-node/model/schema';
import { renameNodeView } from './rename-nodes-node/client';
import { isConfig as isRenameConfig } from './rename-nodes-node/model/schema';
import { proxyNodeSchema } from './schema';
import type { TypeRegistry } from '../../node/core/type-registry';
import type { NodeViewRegistry } from '../../node/core/views';

export const nodeViews = [extractNodesNodeView, renameNodeView, filterNodeView, generateSubscriptionNodeView] as const;

export function registerSubscriptionViews(types: TypeRegistry, views: NodeViewRegistry): void {
  types.registerType(proxyNodeSchema);
  views.registerNodeView(extractNodesNodeView, isExtractNodesConfig);
  views.registerNodeView(renameNodeView, isRenameConfig);
  views.registerNodeView(filterNodeView, isFilterConfig);
  views.registerNodeView(generateSubscriptionNodeView, isGenerateSubscriptionConfig);
}
