import { proxyNodeType } from '@/lib/subscription/schemas/proxy-node';
import type { TypeRegistry } from '@/lib/workflow/node/core/type-registry';
import type { NodeViewRegistry } from '@/lib/workflow/node/core/views';
import { filterNodeView } from './filter-node/client';
import { isConfig as isFilterConfig } from './filter-node/model/schema';
import { mergeNodeView } from './merge-node/client';
import { isConfig as isMergeConfig } from './merge-node/model/schema';
import { renameNodeView } from './rename-node/client';
import { isConfig as isRenameConfig } from './rename-node/model/schema';
import { proxyListNodeView } from './resolve-node/client';
import { isConfig } from './resolve-node/model/schema';

export function registerProxyViews(views: NodeViewRegistry, types: TypeRegistry): void {
  types.registerType(proxyNodeType);
  views.registerNodeView(proxyListNodeView, isConfig);
  views.registerNodeView(mergeNodeView, isMergeConfig);
  views.registerNodeView(renameNodeView, isRenameConfig);
  views.registerNodeView(filterNodeView, isFilterConfig);
}
