import 'server-only';
import { appError } from '@/lib/api';
import type { BusinessErrorCode } from '@/lib/errors';
import { uniqueColumns } from '@/lib/repositories/errors';
import type { Pagination, PaginationParams } from '@/lib/types/pagination';
import * as v from './validation';

export interface Repository<Row, Values> {
  pagination(params: PaginationParams): Pagination<Row>;
  findById(id: string): Row | undefined;
  findByPath(pathname: string): Row | undefined;
  create(values: Values): Row;
  update(id: string, values: Partial<Values>): Row | undefined;
  remove(id: string): Row | undefined;
}

export interface CrudService<Row> {
  list(input: unknown): Pagination<Row>;
  get(input: unknown): Row;
  update(input: unknown): Row;
  remove(input: unknown): { id: string };
}

export function createService<Row extends { id: string; pathname: string }, Values extends { pathname: string }>(
  repository: Repository<Row, Values>,
  validate: (params: Record<string, unknown>) => Values,
  errors: { notFound: BusinessErrorCode; pathExist: BusinessErrorCode; typeExist?: BusinessErrorCode },
  check?: (values: Values, id?: string) => void,
): CrudService<Row> {
  function list(input: unknown): Pagination<Row> {
    const params = v.record(input);

    return repository.pagination(v.pagination(params));
  }

  function get(input: unknown): Row {
    const params = v.record(input);
    const id = v.string(params.id);
    const row = repository.findById(id);

    if (!row) {
      throw appError(errors.notFound);
    }

    return row;
  }

  function update(input: unknown): Row {
    const params = v.record(input);
    const id = params.id === undefined ? undefined : v.string(params.id);
    const existing = id === undefined ? undefined : get({ id });
    const values = validate({ ...existing, ...params });
    const changes: Partial<Values> = {};

    for (const key of Object.keys(params)) {
      if (key !== 'id' && !Object.hasOwn(values, key)) {
        throw appError('common.INVALID_PARAMS');
      }
    }

    for (const key in values) {
      if (Object.hasOwn(params, key)) {
        changes[key] = values[key];
      }
    }

    const duplicate = repository.findByPath(values.pathname);

    if (duplicate && duplicate.id !== id) {
      throw appError(errors.pathExist);
    }

    check?.(values, id);

    if (existing && Object.keys(changes).length === 0) {
      return existing;
    }

    let row: Row | undefined;

    try {
      row = id === undefined ? repository.create(values) : repository.update(id, changes);
    } catch (error) {
      const columns = uniqueColumns(error);

      if (columns.some((column) => column.endsWith('.type')) && errors.typeExist) {
        throw appError(errors.typeExist);
      }

      if (columns.some((column) => column.endsWith('.pathname'))) {
        throw appError(errors.pathExist);
      }

      throw error;
    }

    if (!row) {
      throw appError(errors.notFound);
    }

    return row;
  }

  function remove(input: unknown): { id: string } {
    const params = v.record(input);
    const id = v.string(params.id);
    const row = repository.remove(id);

    if (!row) {
      throw appError(errors.notFound);
    }

    return { id: row.id };
  }

  return { list, get, update, remove };
}
