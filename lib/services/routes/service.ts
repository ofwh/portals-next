import 'server-only';
import type { RouteMode } from '@/lib/constants/routes';
import type { BusinessErrorCode } from '@/lib/errors';
import type { Pagination } from '@/lib/types/pagination';
import type { RouteListParams } from '@/lib/types/routes';
import { validateList } from './validation';
import { createService } from '../shared/crud';
import type { Repository } from '../shared/crud';
import { validateTagIds } from '../shared/tags';

interface RouteRepository<Row, Values, Item extends Row> extends Repository<Row, Values> {
  pagination(params: RouteListParams): Pagination<Item>;
  findTagIds(id: string): string[];
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
    return repository.pagination(validateList(input));
  }

  function get(input: unknown) {
    const row = crud.get(input);

    return { ...row, tagIds: repository.findTagIds(row.id) };
  }

  return { ...crud, list, get };
}
