import { appError } from '@/lib/api';
import type { ExecutionPlan, WorkflowDefinition } from './index';
import { parseWorkflow } from './validation';
import type { ManifestResolver } from '../nodes/core/connections';
import { validateConnection } from '../nodes/core/connections';
import type { TypeRegistry } from '../nodes/core/type-registry';

export function validateArrangement(
  raw: WorkflowDefinition,
  resolve: ManifestResolver,
  types: TypeRegistry,
): ExecutionPlan {
  const flow = parseWorkflow(raw);
  const incoming: Record<string, string[]> = Object.create(null);
  const outgoing = new Map<string, string[]>();
  const accepted: WorkflowDefinition = { ...flow, edges: [] };

  for (const node of flow.nodes) {
    const manifest = resolve(node.type);

    if (node.definitionVersion !== manifest.version) {
      throw appError('workflow.NODE_VERSION');
    }

    incoming[node.id] = [];
    outgoing.set(node.id, []);
  }
  for (const edge of flow.edges) {
    validateConnection(accepted, edge, resolve, types);
    accepted.edges.push(edge);
    incoming[edge.target].push(edge.source);
    outgoing.get(edge.source)!.push(edge.target);
  }
  for (const node of flow.nodes) {
    if (resolve(node.type).input?.required && !incoming[node.id].length) {
      throw appError('workflow.REQUIRED_INPUT');
    }
  }
  const degree = new Map(flow.nodes.map((node) => [node.id, incoming[node.id].length]));
  const order = flow.nodes.filter((node) => degree.get(node.id) === 0).map((node) => node.id);

  for (let i = 0; i < order.length; i++) {
    for (const next of outgoing.get(order[i])!) {
      const count = degree.get(next)! - 1;

      degree.set(next, count);
      if (count === 0) {
        order.push(next);
      }
    }
  }
  if (order.length !== flow.nodes.length) {
    throw appError('workflow.CYCLE');
  }

  return { nodes: flow.nodes, order, incoming };
}
