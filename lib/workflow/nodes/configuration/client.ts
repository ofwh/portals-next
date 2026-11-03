import { registerNodeViews } from './nodes/client';
import { policyGroupSchema } from './nodes/policies/model/output-schema';
import { ruleGroupSchema } from './nodes/rulesets/model/output-schema';
import type { TypeRegistry } from '../core/type-registry';
import type { NodeViewRegistry } from '../core/views';

export { nodeViews } from './nodes/client';

export function registerConfigurationViews(types: TypeRegistry, views: NodeViewRegistry): void {
  types.registerType(ruleGroupSchema);
  types.registerType(policyGroupSchema);
  registerNodeViews(views);
}
