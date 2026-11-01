import { appError } from '@/lib/api';
import type { CanvasNode, FlowSnapshot } from './index';
import { parseEdge, parseNode } from './validation';
import type { ManifestResolver } from '../nodes/core/connections';
import { validateConnection } from '../nodes/core/connections';
import type { TypeRegistry } from '../nodes/core/type-registry';
import { assertJson, isRecord, nonempty, positiveInteger } from '../utils';

export const SNAPSHOT_VERSION = 1;
export type SnapshotMigration = (snapshot: unknown) => unknown;
const migrations = new Map<number, SnapshotMigration>();

export function registerSnapshotMigration(version: number, migrate: SnapshotMigration): void {
  if (!positiveInteger(version) || version >= SNAPSHOT_VERSION || migrations.has(version)) {
    throw appError('common.INVALID_PARAMS');
  }

  migrations.set(version, migrate);
}

export function migrateSnapshot(raw: unknown): FlowSnapshot {
  assertJson(raw);
  let value = raw;

  if (!isRecord(value) || !positiveInteger(value.schemaVersion)) {
    throw appError('workflow.INVALID_SNAPSHOT');
  }

  while (value.schemaVersion !== SNAPSHOT_VERSION) {
    const version: number = value.schemaVersion;
    const migrate = migrations.get(version);

    if (version > SNAPSHOT_VERSION || !migrate) {
      throw appError('workflow.SNAPSHOT_VERSION');
    }

    value = migrate(value);
    assertJson(value);
    if (!isRecord(value) || value.schemaVersion !== version + 1) {
      throw appError('workflow.INVALID_SNAPSHOT');
    }
  }
  if (!nonempty(value.workflowId) || !Array.isArray(value.nodes) || !Array.isArray(value.edges)) {
    throw appError('workflow.INVALID_SNAPSHOT');
  }

  const nodes: CanvasNode[] = value.nodes.map((raw) => {
    const node = parseNode(raw);

    if (
      !isRecord(raw) ||
      !isRecord(raw.position) ||
      typeof raw.position.x !== 'number' ||
      typeof raw.position.y !== 'number'
    ) {
      throw appError('workflow.INVALID_SNAPSHOT');
    }

    return { ...node, position: { x: raw.position.x, y: raw.position.y } };
  });
  const edges = value.edges.map(parseEdge);

  if (
    new Set(nodes.map((node) => node.id)).size !== nodes.length ||
    new Set(edges.map((edge) => edge.id)).size !== edges.length
  ) {
    throw appError('workflow.INVALID_SNAPSHOT');
  }

  const snapshot: FlowSnapshot = { schemaVersion: SNAPSHOT_VERSION, workflowId: value.workflowId, nodes, edges };

  if (value.viewport !== undefined) {
    const viewport = value.viewport;

    if (
      !isRecord(viewport) ||
      typeof viewport.x !== 'number' ||
      typeof viewport.y !== 'number' ||
      typeof viewport.zoom !== 'number' ||
      viewport.zoom <= 0
    ) {
      throw appError('workflow.INVALID_SNAPSHOT');
    }

    snapshot.viewport = { x: viewport.x, y: viewport.y, zoom: viewport.zoom };
  }

  return snapshot;
}

export function serializeSnapshot(snapshot: FlowSnapshot): string {
  return JSON.stringify(migrateSnapshot(snapshot));
}

export function restoreSnapshot(raw: string): FlowSnapshot {
  let value: unknown;

  try {
    value = JSON.parse(raw);
  } catch {
    throw appError('workflow.INVALID_SNAPSHOT');
  }

  return migrateSnapshot(value);
}

export function inspectSnapshot(
  snapshot: FlowSnapshot,
  resolve: ManifestResolver,
  types?: TypeRegistry,
): { nodes: Record<string, 'available' | 'unavailable' | 'version-mismatch'>; invalidEdges: string[] } {
  const nodes: Record<string, 'available' | 'unavailable' | 'version-mismatch'> = Object.create(null);

  for (const node of snapshot.nodes) {
    try {
      nodes[node.id] = resolve(node.type).version === node.definitionVersion ? 'available' : 'version-mismatch';
    } catch {
      nodes[node.id] = 'unavailable';
    }
  }
  const invalidEdges: string[] = [];
  const flow = {
    id: snapshot.workflowId,
    version: snapshot.schemaVersion,
    nodes: snapshot.nodes,
    edges: [] as typeof snapshot.edges,
  };

  for (const edge of snapshot.edges) {
    try {
      validateConnection(flow, edge, resolve, types);
      flow.edges.push(edge);
    } catch {
      invalidEdges.push(edge.id);
    }
  }

  return { nodes, invalidEdges };
}
