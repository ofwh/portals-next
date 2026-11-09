import { proxyGroupType } from '@/lib/subscription/schemas/policy';
import { ruleSetType } from '@/lib/subscription/schemas/ruleset';
import { templateType } from '@/lib/subscription/schemas/template';
import type { TypeRegistry } from '@/lib/workflow/node/core/type-registry';
import type { NodeViewRegistry } from '@/lib/workflow/node/core/views';
import { compileNodeView } from './compile-node/client';
import { isConfig as isCompileConfig } from './compile-node/model/schema';
import { policyResolveNodeView } from './policy-node/client';
import { isConfig as isPolicyConfig } from './policy-node/model/schema';
import { rulesetResolveNodeView } from './ruleset-node/client';
import { isConfig } from './ruleset-node/model/schema';
import { templateResolveNodeView } from './template-node/client';
import { isConfig as isTemplateConfig } from './template-node/model/schema';

export function registerConfigurationViews(views: NodeViewRegistry, types: TypeRegistry): void {
  types.registerType(templateType);
  types.registerType(ruleSetType);
  types.registerType(proxyGroupType);
  views.registerNodeView(compileNodeView, isCompileConfig);
  views.registerNodeView(templateResolveNodeView, isTemplateConfig);
  views.registerNodeView(rulesetResolveNodeView, isConfig);
  views.registerNodeView(policyResolveNodeView, isPolicyConfig);
}
