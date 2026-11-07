import { proxyGroupType } from '@/lib/subscription/schemas/policy';
import { ruleSetType } from '@/lib/subscription/schemas/ruleset';
import type { TypeRegistry } from '@/lib/workflow/node/core/type-registry';
import type { NodeViewRegistry } from '@/lib/workflow/node/core/views';
import { policyResolveNodeView } from './policy-node/client';
import { isConfig as isPolicyConfig } from './policy-node/model/schema';
import { rulesetResolveNodeView } from './ruleset-node/client';
import { isConfig } from './ruleset-node/model/schema';

export function registerConfigurationViews(views: NodeViewRegistry, types: TypeRegistry): void {
  types.registerType(ruleSetType);
  types.registerType(proxyGroupType);
  views.registerNodeView(rulesetResolveNodeView, isConfig);
  views.registerNodeView(policyResolveNodeView, isPolicyConfig);
}
