import { policyGroupsNodeView } from './policies/client';
import { isConfig as isPolicyGroupsConfig } from './policies/model/schema';
import { ruleGroupsNodeView } from './rulesets/client';
import { isConfig as isRuleGroupsConfig } from './rulesets/model/schema';
import type { NodeViewRegistry } from '../../core/views';

export const nodeViews = [ruleGroupsNodeView, policyGroupsNodeView] as const;

export function registerNodeViews(views: NodeViewRegistry): void {
  views.registerNodeView(ruleGroupsNodeView, isRuleGroupsConfig);
  views.registerNodeView(policyGroupsNodeView, isPolicyGroupsConfig);
}
