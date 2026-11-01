import { filterNodeView } from './filter/client';
import { isConfig as isFilterConfig } from './filter/schema';
import { parseNodeView } from './parse/client';
import { isConfig as isParseConfig } from './parse/schema';
import { renameNodeView } from './rename/client';
import { isConfig as isRenameConfig } from './rename/schema';
import { subscriptionNodesSchema } from './schema';
import type { TypeRegistry } from '../core/type-registry';
import type { NodeViewRegistry } from '../core/views';

export const nodeViews = [parseNodeView, renameNodeView, filterNodeView] as const;

export function registerSubscriptionViews(types: TypeRegistry, views: NodeViewRegistry): void {
  types.registerType(subscriptionNodesSchema);
  views.registerNodeView(parseNodeView, isParseConfig);
  views.registerNodeView(renameNodeView, isRenameConfig);
  views.registerNodeView(filterNodeView, isFilterConfig);
}
