import { extractNodesNodeView } from './extract-nodes-node/client';
import { isConfig as isExtractNodesConfig } from './extract-nodes-node/model/schema';
import { filterNodeView } from './filter-nodes-node/client';
import { isConfig as isFilterConfig } from './filter-nodes-node/model/schema';
import { generateSubscriptionNodeView } from './generate-subscription-node/client';
import { isConfig as isGenerateSubscriptionConfig } from './generate-subscription-node/model/schema';
import { parseTemplateNodeView } from './parse-template-node/client';
import { isConfig as isParseTemplateConfig } from './parse-template-node/model/schema';
import { renameNodeView } from './rename-nodes-node/client';
import { isConfig as isRenameConfig } from './rename-nodes-node/model/schema';
import { schema } from './schema';
import type { TypeRegistry } from '../../node/core/type-registry';
import type { NodeViewRegistry } from '../../node/core/views';

export const nodeViews = [
  extractNodesNodeView,
  parseTemplateNodeView,
  renameNodeView,
  filterNodeView,
  generateSubscriptionNodeView,
] as const;

export function registerSubscriptionViews(types: TypeRegistry, views: NodeViewRegistry): void {
  types.registerType(schema.proxyNode);
  schema.templates.forEach((type) => types.registerType(type));
  views.registerNodeView(parseTemplateNodeView, isParseTemplateConfig);
  views.registerNodeView(extractNodesNodeView, isExtractNodesConfig);
  views.registerNodeView(renameNodeView, isRenameConfig);
  views.registerNodeView(filterNodeView, isFilterConfig);
  views.registerNodeView(generateSubscriptionNodeView, isGenerateSubscriptionConfig);
}
