import 'server-only';
import { appError, errorMessage } from '@/lib/api';
import type { Locale } from '@/lib/api';
import { cloneJson, nonempty } from '@/lib/shared/data';
import { buildExecutionPlan, executeFlow } from '../engine';
import type { RunEvent, RunRequest } from '../model';
import { nodeRegistry } from '../node';
import type { NodeRegistry } from '../node/core/registry';

export interface RunOptions {
  signal?: AbortSignal;
  timeout?: number;
  locale?: Locale;
}
export interface RunHandle {
  runId: string;
  done: Promise<void>;
  cancel(): void;
}
interface ActiveRun {
  owner: string;
  controller: AbortController;
}

export class WorkflowRuntime {
  constructor(
    private readonly registry: NodeRegistry = nodeRegistry,
    private readonly runs: Map<string, ActiveRun> = new Map(),
  ) {}

  start(request: RunRequest, owner: string, emit: (event: RunEvent) => void, options: RunOptions = {}): RunHandle {
    if (
      !nonempty(request.runId) ||
      !nonempty(owner) ||
      (options.timeout !== undefined &&
        (!Number.isSafeInteger(options.timeout) || options.timeout <= 0 || options.timeout > 2147483647))
    ) {
      throw appError('common.INVALID_PARAMS');
    }

    if (this.runs.has(request.runId)) {
      throw appError('workflow.RUN_EXISTS');
    }

    const plan = buildExecutionPlan(request.workflow, this.registry);
    const controller = new AbortController();
    const cancel = () => controller.abort();

    options.signal?.addEventListener('abort', cancel, { once: true });
    if (options.signal?.aborted) {
      cancel();
    }

    const timer = setTimeout(cancel, options.timeout ?? 300000);

    this.runs.set(request.runId, { owner, controller });
    const dispatch = (event: RunEvent) => {
      try {
        emit(cloneJson(event));
      } catch {
        cancel();
      }
    };
    const done = Promise.resolve()
      .then(() =>
        executeFlow(
          plan,
          { runId: request.runId, signal: controller.signal, emit: dispatch, locale: options.locale },
          this.registry,
        ),
      )
      .catch(() =>
        dispatch({
          type: 'run.failed',
          runId: request.runId,
          message: errorMessage(appError('common.INTERNAL_ERROR'), options.locale),
        }),
      )
      .finally(() => {
        clearTimeout(timer);
        options.signal?.removeEventListener('abort', cancel);
        this.runs.delete(request.runId);
      });

    return { runId: request.runId, done, cancel };
  }

  cancel(runId: string, owner: string): void {
    const run = this.runs.get(runId);

    if (!run || run.owner !== owner) {
      throw appError('workflow.RUN_NOT_FOUND');
    }

    run.controller.abort();
  }
}
const runtimeGlobal = globalThis as typeof globalThis & { workflowRuns?: Map<string, ActiveRun> };
export const workflowRuntime = new WorkflowRuntime(nodeRegistry, (runtimeGlobal.workflowRuns ??= new Map()));
