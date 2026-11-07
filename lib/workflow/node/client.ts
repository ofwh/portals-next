import { TypeRegistry } from './core/type-registry';
import { NodeViewRegistry } from './core/views';
import { registerConfigurationViews } from '../flows/configuration/client';
import { registerCommonViews } from '../flows/general/client';
import { registerProxyViews } from '../flows/proxies/client';

export const typeRegistry = new TypeRegistry();
export const nodeViewRegistry = new NodeViewRegistry();

registerCommonViews(nodeViewRegistry);
registerProxyViews(nodeViewRegistry, typeRegistry);
registerConfigurationViews(nodeViewRegistry, typeRegistry);

export { defineNodeView } from './core/views';
export const registerNodeView: NodeViewRegistry['registerNodeView'] = (view, isConfig) =>
  nodeViewRegistry.registerNodeView(view, isConfig);
