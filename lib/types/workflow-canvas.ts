import type { Node } from '@xyflow/react';
import type { CanvasNode, NodeRunState } from '@/lib/workflow/model';
import type { NodeManifest } from '@/lib/workflow/node/types';

export const NODE_PREVIEW_SIZE = { width: 220, height: 46 } as const;

export type WorkflowCanvasNode = Node<
  {
    instance: CanvasNode;
    manifest: NodeManifest | undefined;
    available: boolean;
    expanded: boolean;
    runState?: NodeRunState;
  },
  'workflow'
>;
