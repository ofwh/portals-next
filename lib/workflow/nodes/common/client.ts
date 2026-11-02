import { registerNodeViews } from './nodes/client';
import type { NodeViewRegistry } from '../core/views';

export { nodeViews } from './nodes/client';

export function registerCommonViews(views: NodeViewRegistry): void {
  registerNodeViews(views);
}
