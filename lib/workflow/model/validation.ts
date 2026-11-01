import { appError } from '@/lib/api';
import type { FlowEdge, NodeInstance, WorkflowDefinition } from './index';
import { assertJson, cloneJson, isRecord, nonempty, positiveInteger } from '../utils';

export function parseNode(raw: unknown): NodeInstance {
  if (
    !isRecord(raw) ||
    !nonempty(raw.id) ||
    !nonempty(raw.type) ||
    typeof raw.name !== 'string' ||
    !positiveInteger(raw.definitionVersion) ||
    !Object.hasOwn(raw, 'config')
  ) {
    throw appError('common.INVALID_PARAMS');
  }

  assertJson(raw.config);

  return {
    id: raw.id,
    type: raw.type,
    name: raw.name,
    config: cloneJson(raw.config),
    definitionVersion: raw.definitionVersion,
  };
}

export function parseEdge(raw: unknown): FlowEdge {
  if (!isRecord(raw) || !nonempty(raw.id) || !nonempty(raw.source) || !nonempty(raw.target)) {
    throw appError('common.INVALID_PARAMS');
  }

  return { id: raw.id, source: raw.source, target: raw.target };
}

export function parseWorkflow(raw: unknown): WorkflowDefinition {
  assertJson(raw);
  if (
    !isRecord(raw) ||
    !nonempty(raw.id) ||
    !positiveInteger(raw.version) ||
    !Array.isArray(raw.nodes) ||
    !Array.isArray(raw.edges)
  ) {
    throw appError('common.INVALID_PARAMS');
  }

  if (Object.keys(raw).some((key) => !['id', 'version', 'nodes', 'edges'].includes(key))) {
    throw appError('common.INVALID_PARAMS');
  }

  for (const node of raw.nodes) {
    if (
      !isRecord(node) ||
      Object.keys(node).some((key) => !['id', 'type', 'name', 'config', 'definitionVersion'].includes(key))
    ) {
      throw appError('common.INVALID_PARAMS');
    }
  }
  for (const edge of raw.edges) {
    if (!isRecord(edge) || Object.keys(edge).some((key) => !['id', 'source', 'target'].includes(key))) {
      throw appError('common.INVALID_PARAMS');
    }
  }
  const nodes = raw.nodes.map(parseNode);
  const edges = raw.edges.map(parseEdge);

  if (
    new Set(nodes.map((node) => node.id)).size !== nodes.length ||
    new Set(edges.map((edge) => edge.id)).size !== edges.length
  ) {
    throw appError('common.INVALID_PARAMS');
  }

  return { id: raw.id, version: raw.version, nodes, edges };
}
