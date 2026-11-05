import 'server-only';
import type { WorkflowDefinition } from '@/lib/workflow/model';

export function purge(workflow: WorkflowDefinition, generatorId: string): WorkflowDefinition {
  const incoming = new Map<string, string[]>();

  for (const edge of workflow.edges) {
    const sources = incoming.get(edge.target) ?? [];

    sources.push(edge.source);
    incoming.set(edge.target, sources);
  }

  const retained = new Set([generatorId]);
  const pending = [generatorId];

  for (let index = 0; index < pending.length; index++) {
    for (const source of incoming.get(pending[index]) ?? []) {
      if (!retained.has(source)) {
        retained.add(source);
        pending.push(source);
      }
    }
  }

  return {
    ...workflow,
    nodes: workflow.nodes.filter((node) => retained.has(node.id)),
    edges: workflow.edges.filter((edge) => retained.has(edge.source) && retained.has(edge.target)),
  };
}
