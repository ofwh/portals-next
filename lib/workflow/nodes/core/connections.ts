import { appError } from '@/lib/api';
import type { TypeRegistry } from './type-registry';
import { typeRegistry } from './type-registry';
import type { FlowEdge, WorkflowDefinition } from '../../model';
import type { NodeManifest } from '../types';

export type ManifestResolver = (type: string) => NodeManifest;

export function canConnect(source: NodeManifest, target: NodeManifest, types: TypeRegistry = typeRegistry): boolean {
  return source.output !== null && target.input !== null && types.isAssignable(source.output.type, target.input.type);
}

export function validateConnection(
  flow: WorkflowDefinition,
  edge: FlowEdge,
  resolve: ManifestResolver,
  types: TypeRegistry = typeRegistry,
): void {
  const source = flow.nodes.find((node) => node.id === edge.source);
  const target = flow.nodes.find((node) => node.id === edge.target);

  if (!source || !target) {
    throw appError('workflow.INVALID_CONNECTION');
  }

  const from = resolve(source.type);
  const to = resolve(target.type);

  if (!from.output || !to.input) {
    throw appError('workflow.INVALID_CONNECTION');
  }

  if (
    (!from.output.multiple && flow.edges.some((item) => item.source === source.id)) ||
    (!to.input.multiple && flow.edges.some((item) => item.target === target.id))
  ) {
    throw appError('workflow.INVALID_CONNECTION');
  }

  if (!canConnect(from, to, types)) {
    throw appError('workflow.INCOMPATIBLE_TYPE');
  }

  if (
    source.id === target.id ||
    flow.edges.some((item) => item.id === edge.id || (item.source === source.id && item.target === target.id))
  ) {
    throw appError('workflow.INVALID_CONNECTION');
  }

  const visited = new Set<string>();
  const pending = [target.id];

  while (pending.length) {
    const current = pending.pop()!;

    if (current === source.id) {
      throw appError('workflow.CYCLE');
    }

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);
    pending.push(...flow.edges.filter((item) => item.source === current).map((item) => item.target));
  }
}
