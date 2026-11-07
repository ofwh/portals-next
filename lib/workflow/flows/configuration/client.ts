import { ruleSetType } from '@/lib/subscription/schemas/ruleset';
import type { TypeRegistry } from '@/lib/workflow/node/core/type-registry';
import type { NodeViewRegistry } from '@/lib/workflow/node/core/views';
import { rulesetResolveNodeView } from './ruleset-node/client';
import { isConfig } from './ruleset-node/model/schema';

export function registerConfigurationViews(views: NodeViewRegistry, types: TypeRegistry): void {
  types.registerType(ruleSetType);
  views.registerNodeView(rulesetResolveNodeView, isConfig);
}
