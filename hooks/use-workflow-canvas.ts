'use client';

import { useReactFlow } from '@xyflow/react';
import type { Connection, Edge, EdgeChange, NodeChange, Viewport } from '@xyflow/react';
import { useTranslations } from 'next-intl';
import type { ClipboardEvent, PointerEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { appError } from '@/lib/api';
import type { WorkflowCanvasNode } from '@/lib/types/workflow-canvas';
import { NODE_PREVIEW_SIZE } from '@/lib/types/workflow-canvas';
import { toWorkflow } from '@/lib/workflow/model/canvas';
import { parseNode } from '@/lib/workflow/model/validation';
import { nodeViewRegistry, typeRegistry } from '@/lib/workflow/node/client';
import { validateConnection } from '@/lib/workflow/node/core/connections';
import { useWorkflow } from './use-workflow';

const NODE_CLIPBOARD_MIME = 'application/x-workflow-node';

function isEditingText(target: EventTarget) {
  return (
    target instanceof HTMLElement &&
    Boolean(target.isContentEditable || target.closest('input, textarea, select, [role="textbox"]'))
  );
}

export function useWorkflowCanvas() {
  const t = useTranslations();
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
          ariaLabel: node.displayName?.trim() || (manifest?.nameKey ? t(manifest.nameKey) : node.name),
        };
      }),
    [state.flow?.nodes, state.catalog.nodes, state.nodeStates, selectedNodes, showNodeDetails, t],
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

  const canvasRef = useRef<HTMLDivElement>(null);
  const setCanvasElement = useCallback((element: HTMLDivElement | null) => {
    canvasRef.current = element;
  }, []);

  function onCopy(event: ClipboardEvent<HTMLDivElement>) {
    if (event.defaultPrevented || isEditingText(event.target) || window.getSelection()?.isCollapsed === false) {
      return;
    }

    const selected = nodes.filter((node) => node.selected);

    if (selected.length !== 1) {
      return;
    }

    perform(() => {
      const value = JSON.stringify(selected[0].data.instance);

      event.clipboardData.setData(NODE_CLIPBOARD_MIME, value);
      event.clipboardData.setData('text/plain', value);
      event.preventDefault();
    });
  }

  function onPaste(event: ClipboardEvent<HTMLDivElement>) {
    const current = store.getState();
    const flow = current.flow;
    const bounds = canvasRef.current?.getBoundingClientRect();
    const value = event.clipboardData.getData(NODE_CLIPBOARD_MIME);

    if (
      event.defaultPrevented ||
      isEditingText(event.target) ||
      !flow ||
      current.saving ||
      current.running ||
      !bounds ||
      !value
    ) {
      return;
    }

    event.preventDefault();
    perform(() => {
      const raw: unknown = JSON.parse(value);
      const source = parseNode(raw);
      const manifest = current.catalog.nodes.find((node) => node.type === source.type);

      if (manifest?.singleton && flow.nodes.some((node) => node.type === source.type)) {
        return;
      }

      const available = manifest?.version === source.definitionVersion;
      const display = available ? nodeViewRegistry.getNodeView(source.type)?.display : undefined;
      const size =
        showNodeDetails && display ? display.size : { ...NODE_PREVIEW_SIZE, ...(!available ? { height: 96 } : {}) };
      const center = reactFlow.screenToFlowPosition(
        { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 },
        { snapToGrid: false },
      );
      const node = {
        ...source,
        id: crypto.randomUUID(),
        position: { x: center.x - size.width / 2, y: center.y - size.height / 2 },
      };

      current.setFlow({ ...flow, nodes: [...flow.nodes, node] });
      setSelectedNodes(new Set([node.id]));
      setSelectedEdges(new Set());
    });
  }

  const drag = useRef<{
    type: string;
    pointerId: number;
    start: { x: number; y: number };
    offset: { x: number; y: number };
    moved: boolean;
  } | null>(null);
  const [dragPreview, setDragPreview] = useState<{
    node: WorkflowCanvasNode;
    screen: { x: number; y: number };
    zoom: number;
  } | null>(null);

  const clearDrag = useCallback(() => {
    drag.current = null;
    setDragPreview(null);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearDrag();
      }
    };

    window.addEventListener('blur', clearDrag);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('blur', clearDrag);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [clearDrag]);

  function projectDrag(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    const manifest = state.catalog.nodes.find((node) => node.type === current?.type);

    if (!current || !manifest) {
      return null;
    }

    const display = nodeViewRegistry.getNodeView(current.type)?.display;
    const expanded = Boolean(showNodeDetails && display);
    const size = expanded && display ? display.size : NODE_PREVIEW_SIZE;
    const zoom = reactFlow.getZoom();
    const screen = {
      x: event.clientX - current.offset.x * size.width * zoom,
      y: event.clientY - current.offset.y * size.height * zoom,
    };
    const position = reactFlow.screenToFlowPosition(screen, { snapToGrid: false });
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const overCanvas = Boolean(
      target && canvasRef.current?.contains(target) && !target.closest('[data-workflow-canvas-controls]'),
    );
    const node: WorkflowCanvasNode = {
      id: 'drag-preview',
      type: 'workflow',
      position,
      width: size.width,
      height: size.height,
      data: {
        instance: {
          id: 'drag-preview',
          type: manifest.type,
          name: manifest.name,
          definitionVersion: manifest.version,
          config: state.catalog.defaults[manifest.type],
          position,
        },
        manifest,
        available: true,
        expanded,
      },
    };

    return { node, screen, zoom, overCanvas };
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>, type: string) {
    const current = store.getState();

    if (!current.flow || current.saving || current.running || !event.isPrimary || event.button !== 0) {
      return;
    }

    const manifest = current.catalog.nodes.find((node) => node.type === type);

    if (
      event.currentTarget.disabled ||
      (manifest?.singleton && current.flow.nodes.some((node) => node.type === type))
    ) {
      return;
    }

    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();

    drag.current = {
      type,
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      offset: { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height },
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;

    if (!current || current.pointerId !== event.pointerId) {
      return;
    }

    if (Math.hypot(event.clientX - current.start.x, event.clientY - current.start.y) > 4) {
      current.moved = true;
    }

    if (current.moved) {
      setDragPreview(projectDrag(event));
    }
  }

  function dropDrag(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;

    if (!current || current.pointerId !== event.pointerId) {
      return;
    }

    const placement = projectDrag(event);
    const state = store.getState();

    clearDrag();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (current.moved && placement?.overCanvas && state.flow && !state.saving && !state.running) {
      perform(() => state.addNode(current.type, placement.node.position));
    }
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
    setCanvasElement,
    onCopy,
    onPaste,
    dragPreview,
    startDrag,
    moveDrag,
    dropDrag,
    clearDrag,
    onNodesChange,
    onEdgesChange,
    onViewportChange,
    onConnect,
    isValidConnection,
    reactFlow,
  };
}
