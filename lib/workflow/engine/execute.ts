import 'server-only';
import { appError, AppError, businessCode, errorMessage } from '@/lib/api';
import type { Locale } from '@/lib/api';
import { cloneJson } from '@/lib/shared/data';
import type { ExecutionPlan, NodeRunState, RunEvent } from '../model';
import { resolveOutputType } from '../node/core/ports';
import type { NodeRegistry } from '../node/core/registry';
import { nodeRegistry } from '../node/core/registry';

export interface FlowExecutionContext {
  runId: string;
  signal: AbortSignal;
  emit(event: RunEvent): void;
  locale?: Locale;
}

export function abortable<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(appError('workflow.CANCELLED'));

    if (signal.aborted) {
      abort();

      return;
    }

    signal.addEventListener('abort', abort, { once: true });
    operation.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}

export async function executeFlow(
  plan: ExecutionPlan,
  context: FlowExecutionContext,
  registry: NodeRegistry = nodeRegistry,
): Promise<void> {
  const nodes = new Map(plan.nodes.map((node) => [node.id, node]));
  const outputs = new Map<string, unknown>();
  const states = new Map<string, NodeRunState>();

  const emitState = (state: NodeRunState) => {
    states.set(state.nodeId, state);
    context.emit({ type: 'node.updated', runId: context.runId, node: cloneJson(state) });
  };
  const finishRemaining = () => {
    for (const id of plan.order) {
      const state = states.get(id)!;

      if (state.status === 'pending') {
        emitState({ ...state, status: 'skipped', finishedAt: Date.now() });
      }
    }
  };

  context.emit({ type: 'run.started', runId: context.runId });
  for (const id of plan.order) {
    emitState({ runId: context.runId, nodeId: id, status: 'pending' });
  }
  try {
    for (const id of plan.order) {
      context.signal.throwIfAborted();
      const node = nodes.get(id)!;
      const registered = registry.getNode(node.type);
      const input = plan.incoming[id].map((upstream) => cloneJson(outputs.get(upstream)));
      const inputSources = plan.incoming[id].map((upstream) => {
        const source = nodes.get(upstream)!;
        const output = registry.getNode(source.type).manifest.output;

        if (!output) {
          throw appError('workflow.INVALID_CONNECTION');
        }

        return {
          nodeId: upstream,
          name: source.displayName?.trim() || source.name,
          type: resolveOutputType(output, source.config),
        };
      });
      const state: NodeRunState = {
        runId: context.runId,
        nodeId: id,
        status: 'running',
        input,
        inputNodes: inputSources.map(({ nodeId, name }) => ({ nodeId, name })),
        startedAt: Date.now(),
      };

      emitState(state);
      try {
        const result = await abortable(
          registered.run(input, node.config, {
            runId: context.runId,
            nodeId: id,
            signal: context.signal,
            inputSources,
          }),
          context.signal,
        );

        context.signal.throwIfAborted();
        if (registered.manifest.output) {
          outputs.set(id, cloneJson(result));
        }

        emitState({
          ...state,
          status: 'success',
          finishedAt: Date.now(),
          ...(registered.manifest.output ? { output: result } : {}),
        });
      } catch (error) {
        const failure = context.signal.aborted
          ? appError('workflow.CANCELLED')
          : error instanceof AppError
            ? error
            : appError('common.INTERNAL_ERROR');

        emitState({
          ...state,
          status: context.signal.aborted ? 'cancelled' : 'failed',
          finishedAt: Date.now(),
          error: { code: businessCode(failure.code), message: errorMessage(failure, context.locale) },
        });

        throw failure;
      }
    }
    context.signal.throwIfAborted();
    const upstream = new Set(Object.values(plan.incoming).flat());
    const terminal = Object.fromEntries([...outputs].filter(([id]) => !upstream.has(id)));

    context.emit({ type: 'run.completed', runId: context.runId, outputs: terminal });
  } catch (error) {
    const failure = context.signal.aborted
      ? appError('workflow.CANCELLED')
      : error instanceof AppError
        ? error
        : appError('common.INTERNAL_ERROR');

    finishRemaining();
    context.emit({
      type: context.signal.aborted ? 'run.cancelled' : 'run.failed',
      runId: context.runId,
      message: errorMessage(failure, context.locale),
    });
  }
}
