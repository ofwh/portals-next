import { policyGroupsNodeView } from './policies-node/client';
import { policyGroupSchema } from './policies-node/model/output-schema';
import { isConfig as isPolicyGroupsConfig } from './policies-node/model/schema';
import { ruleGroupsNodeView } from './rulesets-node/client';
import { ruleGroupSchema } from './rulesets-node/model/output-schema';
import { isConfig as isRuleGroupsConfig } from './rulesets-node/model/schema';
import type { TypeRegistry } from '../../node/core/type-registry';
import type { NodeViewRegistry } from '../../node/core/views';

export const nodeViews = [ruleGroupsNodeView, policyGroupsNodeView] as const;

export function registerConfigurationViews(types: TypeRegistry, views: NodeViewRegistry): void {
  types.registerType(ruleGroupSchema);
  types.registerType(policyGroupSchema);
  views.registerNodeView(ruleGroupsNodeView, isRuleGroupsConfig);
  views.registerNodeView(policyGroupsNodeView, isPolicyGroupsConfig);
}
