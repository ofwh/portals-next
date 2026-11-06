import { TypeRegistry } from './core/type-registry';
import { NodeViewRegistry } from './core/views';
import { registerCommonViews } from '../flows/general/client';

export const typeRegistry = new TypeRegistry();
export const nodeViewRegistry = new NodeViewRegistry();

registerCommonViews(nodeViewRegistry);

export { defineNodeView } from './core/views';
export const registerNodeView: NodeViewRegistry['registerNodeView'] = (view, isConfig) =>
  nodeViewRegistry.registerNodeView(view, isConfig);
