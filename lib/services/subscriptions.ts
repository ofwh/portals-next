import 'server-only';
import { appError } from '@/lib/api';
import { SUBSCRIPTION_TAG_GROUP } from '@/lib/constants/tags';
import repository from '@/lib/repositories/subscriptions';
import type { SubscriptionValues } from '@/lib/repositories/subscriptions';
import type { ConsumerRequest } from '@/lib/types/route';
import { validateArrangement } from '@/lib/workflow/model/arrangement';
import { toWorkflow } from '@/lib/workflow/model/canvas';
import { restoreSnapshot, serializeSnapshot } from '@/lib/workflow/model/snapshot';
import { nodeRegistry } from '@/lib/workflow/node';
import consumer from './routes/consumers/subscriptions';
import { createService } from './shared/crud';
import { validateTagIds } from './shared/tags';
import * as v from './shared/validation';

function validate(params: Record<string, unknown>) {
  const name = v.string(params.name).trim();

  if (name.length > 100) {
    throw appError('common.INVALID_PARAMS');
  }

  const flow = v.nullableString(params.flow);

  if (flow?.trim()) {
    restoreSnapshot(flow);
  }

  return {
    name,
    description: v.nullableString(params.description),
    status: v.boolean(params.status),
    pathname: v.pathname(params.pathname),
    flow: flow?.trim() ? flow : null,
    token: v.nullableString(params.token),
    expiredAt: v.date(params.expiredAt),
    tagIds: validateTagIds(params.tagIds, SUBSCRIPTION_TAG_GROUP),
  };
}

const crud = createService(
  {
    ...repository,
    create(values: SubscriptionValues) {
      const id = crypto.randomUUID();
      const flow = values.flow ? serializeSnapshot({ ...restoreSnapshot(values.flow), workflowId: id }) : null;

      return repository.create({ ...values, flow }, id);
    },
    update(id, values) {
      return repository.update(id, Object.hasOwn(values, 'flow') ? { ...values, flowDraft: null } : values);
    },
  },
  validate,
  {
    notFound: 'subscriptions.NOT_FOUND',
    pathExist: 'subscriptions.PATH_EXIST',
  },
);

export function list(input: unknown) {
  const params = v.record(input);

  if (Object.keys(params).some((key) => !['page', 'size', 'search', 'status'].includes(key))) {
    throw appError('common.INVALID_PARAMS');
  }

  const result = repository.pagination({
    ...v.pagination(params),
    search: params.search === undefined ? '' : v.string(params.search, true).trim(),
    status: params.status === undefined ? 'all' : v.choice(params.status, ['all', 'enabled', 'disabled']),
  });

  return {
    ...result,
    data: result.data.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      pathname: row.pathname,
      status: row.status,
      updatedAt: row.updatedAt,
      hasFlow: row.flow !== null,
      tags: row.tags,
    })),
  };
}

function identifier(input: unknown) {
  const params = v.record(input);

  if (Object.keys(params).some((key) => key !== 'id')) {
    throw appError('common.INVALID_PARAMS');
  }

  return params;
}

export function detail(input: unknown) {
  const row = crud.get(identifier(input));

  return { ...row, tagIds: repository.findTagIds(row.id) };
}

export function update(input: unknown) {
  const params = v.record(input);

  if (typeof params.flow === 'string' && params.flow.trim()) {
    const snapshot = restoreSnapshot(params.flow);

    if (params.id !== undefined && snapshot.workflowId !== params.id) {
      throw appError('workflow.INVALID_SNAPSHOT');
    }

    validateArrangement(toWorkflow(snapshot), (type) => nodeRegistry.getNode(type).manifest, nodeRegistry.types);
  }

  return crud.update(input);
}

export function remove(input: unknown) {
  return crud.remove(identifier(input));
}

export function handle(input: ConsumerRequest): Promise<Response> {
  return consumer.handle(input);
}

const service = { list, detail, update, remove, handle };

export default service;
