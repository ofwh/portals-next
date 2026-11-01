'use client';

import { useReactFlow } from '@xyflow/react';
import type { Connection, Edge, EdgeChange, NodeChange, Viewport } from '@xyflow/react';
import type { DragEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { appError } from '@/lib/api';
import type { WorkflowCanvasNode } from '@/lib/types/workflow-canvas';
import { NODE_PREVIEW_SIZE } from '@/lib/types/workflow-canvas';
import { NODE_TYPE_MIME, toWorkflow } from '@/lib/workflow/model/canvas';
import { nodeViewRegistry, typeRegistry } from '@/lib/workflow/nodes/client';
import { validateConnection } from '@/lib/workflow/nodes/core/connections';
import { useWorkflow } from './use-workflow';

export function useWorkflowCanvas() {
  const state = useWorkflow();
  const { store, notifyError } = state;
  const reactFlow = useReactFlow<WorkflowCanvasNode>();
  const [selectedNodes, setSelectedNodes] = useState<ReadonlySet<string>>(new Set());
  const [selectedEdges, setSelectedEdges] = useState<ReadonlySet<string>>(new Set());
  const [showNodeDetails, setShowNodeDetails] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const nodes = useMemo<WorkflowCanvasNode[]>(
    () =>
      (state.flow?.nodes ?? []).map((node) => {
        const manifest = state.catalog.nodes.find((item) => item.type === node.type);
        const view = nodeViewRegistry.getNodeView(node.type);
        const available = Boolean(manifest?.version === node.definitionVersion);
        const expanded = Boolean(available && showNodeDetails && view?.display);
        const size =
          expanded && view?.display
            ? view.display.size
            : { ...NODE_PREVIEW_SIZE, ...(!available ? { height: 96 } : {}) };

        return {
          id: node.id,
          type: 'workflow',
          position: node.position,
          data: { instance: node, manifest, available, expanded, runState: state.nodeStates[node.id] },
          selected: selectedNodes.has(node.id),
          width: size.width,
          height: size.height,
          ariaLabel: node.name,
        };
      }),
    [state.flow?.nodes, state.catalog.nodes, state.nodeStates, selectedNodes, showNodeDetails],
  );
  const edges = useMemo<Edge[]>(
    () => (state.flow?.edges ?? []).map((edge) => ({ ...edge, selected: selectedEdges.has(edge.id) })),
    [state.flow?.edges, selectedEdges],
  );

  const perform = useCallback(
    (action: () => void) => {
      try {
        action();
      } catch (error) {
        notifyError(error);
      }
    },
    [notifyError],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange<WorkflowCanvasNode>[]) => {
      const selections = changes.filter((change) => change.type === 'select');

      if (selections.length) {
        setSelectedNodes((current) => {
          const next = new Set(current);

          for (const change of selections) {
            if (change.selected) {
              next.add(change.id);
            } else {
              next.delete(change.id);
            }
          }

          return next;
        });
      }

      const current = store.getState();
      const flow = current.flow;
      const positions = changes.filter((change) => change.type === 'position');
      const removed = new Set(changes.filter((change) => change.type === 'remove').map((change) => change.id));

      if (!flow || current.saving || current.running || (!positions.length && !removed.size)) {
        return;
      }

      perform(() =>
        current.setFlow({
          ...flow,
          nodes: flow.nodes
            .filter((node) => !removed.has(node.id))
            .map((node) => {
              const position = positions.find((change) => change.id === node.id)?.position;

              return position ? { ...node, position } : node;
            }),
          edges: flow.edges.filter((edge) => !removed.has(edge.source) && !removed.has(edge.target)),
        }),
      );
    },
    [store, perform],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      const selections = changes.filter((change) => change.type === 'select');

      if (selections.length) {
        setSelectedEdges((current) => {
          const next = new Set(current);

          for (const change of selections) {
            if (change.selected) {
              next.add(change.id);
            } else {
              next.delete(change.id);
            }
          }

          return next;
        });
      }

      const current = store.getState();
      const flow = current.flow;
      const removed = new Set(changes.filter((change) => change.type === 'remove').map((change) => change.id));

      if (!flow || current.saving || current.running || !removed.size) {
        return;
      }

      perform(() => current.setFlow({ ...flow, edges: flow.edges.filter((edge) => !removed.has(edge.id)) }));
    },
    [store, perform],
  );

  const onViewportChange = useCallback(
    (viewport: Viewport) => {
      const current = store.getState();
      const flow = current.flow;

      if (
        !flow ||
        current.saving ||
        current.running ||
        (flow.viewport?.x === viewport.x && flow.viewport.y === viewport.y && flow.viewport.zoom === viewport.zoom)
      ) {
        return;
      }

      perform(() => current.setFlow({ ...flow, viewport }));
    },
    [store, perform],
  );

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      const current = store.getState();

      if (!current.flow || current.saving || current.running) {
        return false;
      }

      try {
        validateConnection(
          toWorkflow(current.flow),
          { id: 'connection-preview', source: connection.source, target: connection.target },
          (type) => {
            const manifest = current.catalog.nodes.find((item) => item.type === type);

            if (!manifest) {
              throw appError('workflow.NODE_NOT_FOUND');
            }

            return manifest;
          },
          typeRegistry,
        );

        return true;
      } catch {
        return false;
      }
    },
    [store],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      perform(() => store.getState().connectNodes(connection.source, connection.target));
    },
    [store, perform],
  );

  function drop(event: DragEvent<HTMLDivElement>) {
    if (!event.dataTransfer.types.includes(NODE_TYPE_MIME)) {
      return;
    }

    event.preventDefault();
    const current = store.getState();

    if (current.saving || current.running) {
      return;
    }

    const type = event.dataTransfer.getData(NODE_TYPE_MIME);
    const position = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY });

    perform(() => current.addNode(type, position));
  }

  return {
    ...state,
    saving: state.saving || state.running,
    nodes,
    edges,
    showNodeDetails,
    setShowNodeDetails,
    editingId,
    setEditingId,
    drop,
    onNodesChange,
    onEdgesChange,
    onViewportChange,
    onConnect,
    isValidConnection,
    reactFlow,
  };
}
