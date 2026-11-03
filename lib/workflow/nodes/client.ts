import { registerCommonViews } from './common/client';
import { registerConfigurationViews } from './configuration/client';
import { TypeRegistry } from './core/type-registry';
import { NodeViewRegistry } from './core/views';
import { registerSubscriptionViews } from './subscription/client';

export const typeRegistry = new TypeRegistry();
export const nodeViewRegistry = new NodeViewRegistry();

registerCommonViews(nodeViewRegistry);
registerSubscriptionViews(typeRegistry, nodeViewRegistry);
registerConfigurationViews(typeRegistry, nodeViewRegistry);

export { defineNodeView } from './core/views';
export const registerNodeView: NodeViewRegistry['registerNodeView'] = (view, isConfig) =>
  nodeViewRegistry.registerNodeView(view, isConfig);
