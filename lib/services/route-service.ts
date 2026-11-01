import 'server-only';
import { appError } from '@/lib/api';
import type { RouteMode } from '@/lib/constants/routes';
import type { BusinessErrorCode } from '@/lib/errors';
import tags from '@/lib/repositories/tags';
import type { Pagination } from '@/lib/types/pagination';
import type { RouteListParams } from '@/lib/types/routes';
import { createService } from './crud';
import type { Repository } from './crud';
import * as v from './validation';

interface RouteRepository<Row, Values, Item extends Row> extends Repository<Row, Values> {
  pagination(params: RouteListParams): Pagination<Item>;
  findTagIds(id: string): string[];
}

function validateTagIds(value: unknown, type: RouteMode): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw appError('common.INVALID_PARAMS');
  }

  const ids = [...new Set(value.map((id: unknown) => v.string(id)))];
  const selected = tags.findByIds(ids);

  if (selected.length !== ids.length || selected.some((tag) => tag.group !== type)) {
    throw appError('common.INVALID_PARAMS');
  }

  return ids;
}

export function createRouteService<
  Row extends { id: string; pathname: string },
  Values extends { pathname: string },
  Item extends Row,
>(
  type: RouteMode,
  repository: RouteRepository<Row, Values & { tagIds?: string[] }, Item>,
  validate: (params: Record<string, unknown>) => Values,
  errors: { notFound: BusinessErrorCode; pathExist: BusinessErrorCode },
) {
  const crud = createService(
    repository,
    (params) => ({ ...validate(params), tagIds: validateTagIds(params.tagIds, type) }),
    errors,
  );

  function list(input: unknown): Pagination<Item> {
    const params = v.record(input);
    const pagination = v.pagination(params);
    const search = params.search === undefined ? '' : v.string(params.search, true).trim();
    const status = params.status === undefined ? 'all' : v.choice(params.status, ['all', 'enabled', 'disabled']);

    return repository.pagination({ ...pagination, search, status });
  }

  function get(input: unknown) {
    const row = crud.get(input);

    return { ...row, tagIds: repository.findTagIds(row.id) };
  }

  return { ...crud, list, get };
}
