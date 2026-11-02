import { registerNodeViews } from './nodes/client';
import { proxyNodeSchema } from './proxy-node-schema';
import type { TypeRegistry } from '../core/type-registry';
import type { NodeViewRegistry } from '../core/views';

export { nodeViews } from './nodes/client';

export function registerSubscriptionViews(types: TypeRegistry, views: NodeViewRegistry): void {
  types.registerType(proxyNodeSchema);
  registerNodeViews(views);
}
