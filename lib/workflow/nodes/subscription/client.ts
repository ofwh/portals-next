import { contentExtractNodeView } from './content-extract/client';
import {
  outputSchema as extendedNodesSchema,
  isConfig as isContentExtractConfig,
} from './content-extract/model/schema';
import { filterNodeView } from './filter/client';
import { isConfig as isFilterConfig } from './filter/model/schema';
import { parseNodeView } from './parse/client';
import { isConfig as isParseConfig } from './parse/model/schema';
import { renameNodeView } from './rename/client';
import { isConfig as isRenameConfig } from './rename/model/schema';
import { subscriptionNodesSchema } from './schema';
import type { TypeRegistry } from '../core/type-registry';
import type { NodeViewRegistry } from '../core/views';

export const nodeViews = [parseNodeView, contentExtractNodeView, renameNodeView, filterNodeView] as const;

export function registerSubscriptionViews(types: TypeRegistry, views: NodeViewRegistry): void {
  types.registerType(subscriptionNodesSchema);
  types.registerType(extendedNodesSchema);
  views.registerNodeView(contentExtractNodeView, isContentExtractConfig);
  views.registerNodeView(parseNodeView, isParseConfig);
  views.registerNodeView(renameNodeView, isRenameConfig);
  views.registerNodeView(filterNodeView, isFilterConfig);
}
