import 'server-only';
import type { ExecutionPlan, WorkflowDefinition } from '../model';
import { validateArrangement } from '../model/arrangement';
import type { NodeRegistry } from '../nodes/core/registry';
import { nodeRegistry } from '../nodes/core/registry';
import { cloneJson, freezeDeep } from '../utils';

export function buildExecutionPlan(raw: WorkflowDefinition, registry: NodeRegistry = nodeRegistry): ExecutionPlan {
  const plan = validateArrangement(raw, (type) => registry.getNode(type).manifest, registry.types);
  const nodes = plan.nodes.map((node) => ({ ...node, config: registry.getNode(node.type).parseConfig(node.config) }));

  return freezeDeep(cloneJson({ ...plan, nodes }));
}

export function validateWorkflow(flow: WorkflowDefinition, registry: NodeRegistry = nodeRegistry): void {
  buildExecutionPlan(flow, registry);
}
