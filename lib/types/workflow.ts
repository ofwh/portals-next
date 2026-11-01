import type { NodeGroup, NodeManifest } from '@/lib/workflow/nodes/types';

export interface WorkflowNodeCatalog {
  groups: NodeGroup[];
  nodes: NodeManifest[];
  defaults: Record<string, unknown>;
}
