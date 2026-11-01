import { appError } from '@/lib/api';
import type { CanvasNode, FlowSnapshot, WorkflowDefinition } from './index';
import type { NodeManifest } from '../nodes/types';
import { cloneJson, nonempty } from '../utils';

export const NODE_TYPE_MIME = 'application/x-workflow-node-type';

export function createNodeInstance(
  manifest: NodeManifest,
  defaultConfig: unknown,
  position: CanvasNode['position'],
  id = crypto.randomUUID(),
): CanvasNode {
  if (!nonempty(id) || !Number.isFinite(position.x) || !Number.isFinite(position.y)) {
    throw appError('common.INVALID_PARAMS');
  }

  return {
    id,
    type: manifest.type,
    name: manifest.name,
    config: cloneJson(defaultConfig),
    definitionVersion: manifest.version,
    position: { ...position },
  };
}

export function updateNodeConfig<C>(snapshot: FlowSnapshot, nodeId: string, value: C): FlowSnapshot {
  if (!snapshot.nodes.some((node) => node.id === nodeId)) {
    throw appError('workflow.NODE_NOT_FOUND');
  }

  return {
    ...snapshot,
    nodes: snapshot.nodes.map((node) => (node.id === nodeId ? { ...node, config: cloneJson(value) } : node)),
  };
}

export function toWorkflow(snapshot: FlowSnapshot): WorkflowDefinition {
  return cloneJson({
    id: snapshot.workflowId,
    version: snapshot.schemaVersion,
    nodes: snapshot.nodes.map(({ id, type, name, config, definitionVersion }) => ({
      id,
      type,
      name,
      config,
      definitionVersion,
    })),
    edges: snapshot.edges,
  });
}

export function toCanvasPosition(
  point: { x: number; y: number },
  viewport: { x: number; y: number; zoom: number },
): { x: number; y: number } {
  if (![point.x, point.y, viewport.x, viewport.y, viewport.zoom].every(Number.isFinite) || viewport.zoom <= 0) {
    throw appError('common.INVALID_PARAMS');
  }

  return { x: (point.x - viewport.x) / viewport.zoom, y: (point.y - viewport.y) / viewport.zoom };
}
