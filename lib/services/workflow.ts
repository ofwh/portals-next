import { getMessages } from 'next-intl/server';
import 'server-only';
import { appError } from '@/lib/api';
import type { Locale } from '@/lib/api';
import repository from '@/lib/repositories/subscriptions';
import type { WorkflowNodeCatalog } from '@/lib/types/workflow';
import type { RunEvent } from '@/lib/workflow/model';
import { validateArrangement } from '@/lib/workflow/model/arrangement';
import { toWorkflow } from '@/lib/workflow/model/canvas';
import { restoreSnapshot, serializeSnapshot } from '@/lib/workflow/model/snapshot';
import { nodeRegistry } from '@/lib/workflow/nodes';
import type { NodeLabel } from '@/lib/workflow/nodes/types';
import { nodeLabel } from '@/lib/workflow/nodes/utils';
import type { WorkflowRuntime } from '@/lib/workflow/runtime/manager';
import { workflowRuntime } from '@/lib/workflow/runtime/manager';
import * as v from './validation';

export interface WorkflowRunContext {
  signal: AbortSignal;
  emit(event: RunEvent): void;
  locale?: Locale;
  runtime?: WorkflowRuntime;
}

function params(raw: unknown, allowed: readonly string[]): Record<string, unknown> {
  const value = v.record(raw);

  if (Object.keys(value).some((key) => !allowed.includes(key))) {
    throw appError('common.INVALID_PARAMS');
  }

  return value;
}

export async function list(raw: unknown): Promise<WorkflowNodeCatalog> {
  params(raw, []);
  const messages = await getMessages();
  const localize = <T extends NodeLabel>(value: T): T =>
    value.nameKey ? { ...value, ...nodeLabel(value.nameKey, messages) } : value;
  const groups = nodeRegistry.listGroups().map((group) => ({
    ...localize(group),
    nodes: group.nodes.map(localize),
  }));

  return { groups, nodes: nodeRegistry.manifests().map(localize), defaults: nodeRegistry.defaults() };
}

export function draft(raw: unknown): { id: string } {
  const value = params(raw, ['id', 'flow']);
  const id = v.string(value.id);
  const snapshot = restoreSnapshot(v.string(value.flow));

  if (snapshot.workflowId !== id) {
    throw appError('workflow.INVALID_SNAPSHOT');
  }

  validateArrangement(toWorkflow(snapshot), (type) => nodeRegistry.getNode(type).manifest, nodeRegistry.types);

  if (!repository.update(id, { flowDraft: serializeSnapshot(snapshot) })) {
    throw appError('subscriptions.NOT_FOUND');
  }

  return { id };
}

export function run(raw: unknown, context: WorkflowRunContext) {
  const value = params(raw, ['id', 'runId', 'timeout']);
  const id = v.string(value.id);
  const runId = v.string(value.runId);
  const subscription = repository.findById(id);

  if (!subscription) {
    throw appError('subscriptions.NOT_FOUND');
  }

  if (!subscription.flowDraft) {
    throw appError('workflow.DRAFT_NOT_FOUND');
  }

  const snapshot = restoreSnapshot(subscription.flowDraft);

  if (snapshot.workflowId !== id) {
    throw appError('workflow.INVALID_SNAPSHOT');
  }

  const workflow = toWorkflow(snapshot);
  const timeout = value.timeout === undefined ? undefined : v.positiveInteger(value.timeout);

  const token = crypto.randomUUID();
  const handle = (context.runtime ?? workflowRuntime).start({ runId, workflow }, token, context.emit, {
    timeout,
    locale: context.locale,
    signal: context.signal,
  });

  return { ...handle, token };
}

export function cancel(raw: unknown): { runId: string } {
  const value = params(raw, ['runId', 'token']);
  const runId = v.string(value.runId);
  const token = v.string(value.token);

  workflowRuntime.cancel(runId, token);

  return { runId };
}

const service = { list, draft, run, cancel };

export default service;
