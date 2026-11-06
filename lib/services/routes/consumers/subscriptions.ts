import 'server-only';
import { appError, AppError } from '@/lib/api';
import repository from '@/lib/repositories/subscriptions';
import { purge } from '@/lib/services/subscriptions/purge';
import { routeError } from '@/lib/services/subscriptions/response';
import { validateFlow } from '@/lib/services/subscriptions/validation';
import { validPathname } from '@/lib/shared/validation';
import type { ConsumerRequest, RouteConsumer, RouteContext } from '@/lib/types/route';
import { workflowRuntime } from '@/lib/workflow/runtime/manager';
import { requestAuthorize, requestExpired, requestParameters } from '../middleware';

async function generate(context: RouteContext<'subscriptions'>): Promise<void> {
  const { flow, generatorId } = (() => {
    try {
      const { workflow, generatorId } = validateFlow(context.config);

      return { flow: purge(workflow, generatorId), generatorId };
    } catch (error) {
      throw Object.assign(appError('subscriptions.ROUTE_CONFIG_ERROR'), { cause: error });
    }
  })();

  let content: string | undefined;
  let failureMessage: string | undefined;
  let completed = false;
  const runId = crypto.randomUUID();
  const run = workflowRuntime.start(
    { runId, workflow: flow },
    crypto.randomUUID(),
    (event) => {
      if (
        event.type === 'node.updated' &&
        event.node.nodeId === generatorId &&
        event.node.status === 'success' &&
        typeof event.node.output === 'string'
      ) {
        content = event.node.output;
      }

      if (event.type === 'run.completed') {
        completed = true;
      }

      if (event.type === 'run.failed' || event.type === 'run.cancelled') {
        failureMessage = event.message;
      }
    },
    { signal: context.req.signal },
  );

  await run.done;

  if (!completed || content === undefined) {
    throw new Error(failureMessage ?? 'Subscription workflow produced no subscription output.');
  }

  context.response = new Response(content, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export async function handle(input: ConsumerRequest): Promise<Response> {
  try {
    if (!['GET', 'POST'].includes(input.req.method)) {
      return routeError('notFound');
    }

    if (!validPathname(input.pathname)) {
      return routeError('notFound');
    }

    const config = repository.findByPath(input.pathname);

    if (!config || !config.status) {
      return routeError('notFound');
    }

    const context: RouteContext<'subscriptions'> = {
      ...input,
      config,
      now: new Date(),
      parameters: null,
      outbound: null,
      upstream: null,
      snapshot: null,
      response: null,
    };

    await requestParameters<'subscriptions'>()(context, () =>
      requestAuthorize<'subscriptions'>()(context, () =>
        requestExpired<'subscriptions'>()(context, () => generate(context)),
      ),
    );

    if (!context.response) {
      throw new Error();
    }

    return context.response;
  } catch (error) {
    if (error instanceof AppError && error.code === 'subscriptions.ROUTE_CONFIG_ERROR') {
      return routeError('config');
    }

    if (error && typeof error === 'object' && 'status' in error && (error.status === 401 || error.status === 410)) {
      return routeError('notFound');
    }

    return routeError('service');
  }
}

const subscriptions: RouteConsumer<'subscriptions'> = { mode: 'subscriptions', handle };

export default subscriptions;
