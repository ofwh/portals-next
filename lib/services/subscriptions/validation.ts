import 'server-only';
import { appError } from '@/lib/api';
import type { ConfigMap } from '@/lib/types/route';
import { validateWorkflow } from '@/lib/workflow/engine/plan';
import { definition } from '@/lib/workflow/flows/subscription/generate-subscription-node/model/definition';
import type { WorkflowDefinition } from '@/lib/workflow/model';
import { toWorkflow } from '@/lib/workflow/model/canvas';
import { restoreSnapshot } from '@/lib/workflow/model/snapshot';

interface ValidatedFlow {
  workflow: WorkflowDefinition;
  generatorId: string;
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
  const generators = workflow.nodes.filter((node) => node.type === definition.type);

  if (generators.length !== 1) {
    throw appError('subscriptions.GENERATOR_REQUIRED');
  }

  validateWorkflow(workflow);

  return { workflow, generatorId: generators[0].id };
}
