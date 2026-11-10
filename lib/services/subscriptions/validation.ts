import 'server-only';
import { appError } from '@/lib/api';
import type { ConfigMap } from '@/lib/types/route';
import { validateWorkflow } from '@/lib/workflow/engine/plan';
import { definition } from '@/lib/workflow/flows/configuration/compile-node/model/definition';
import type { WorkflowDefinition } from '@/lib/workflow/model';
import { toWorkflow } from '@/lib/workflow/model/canvas';
import { restoreSnapshot } from '@/lib/workflow/model/snapshot';

interface ValidatedFlow {
  workflow: WorkflowDefinition;
  compilerId: string;
}

export function validateFlow(config: Pick<ConfigMap['subscriptions'], 'id' | 'flow'>): ValidatedFlow {
  if (!config.flow?.trim()) {
    throw appError('subscriptions.WORKFLOW_NOT_SAVED');
  }

  const snapshot = restoreSnapshot(config.flow);

  if (snapshot.workflowId !== config.id) {
    throw appError('workflow.INVALID_SNAPSHOT');
  }

  const workflow = toWorkflow(snapshot);
  const compilers = workflow.nodes.filter((node) => node.type === definition.type);

  if (compilers.length !== 1) {
    throw appError('subscriptions.COMPILER_REQUIRED');
  }

  validateWorkflow(workflow);

  return { workflow, compilerId: compilers[0].id };
}
