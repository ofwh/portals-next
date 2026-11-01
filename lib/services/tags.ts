import 'server-only';
import { appError } from '@/lib/api';
import { TAG_GROUPS } from '@/lib/constants';
import repository from '@/lib/repositories/tags';
import type { TagRow, TagValues } from '@/lib/repositories/tags';
import * as v from './validation';

const fields = ['group', 'label', 'color', 'bgColor', 'rounded'] as const;
const groups = TAG_GROUPS.map((group) => group.value);

function params(input: unknown, allowed: readonly string[]): Record<string, unknown> {
  const result = v.record(input);

  if (Object.keys(result).some((key) => !allowed.includes(key))) {
    throw appError('common.INVALID_PARAMS');
  }

  return result;
}

function color(value: unknown): string {
  const result = v.string(value).trim();

  if (!/^#[\da-f]{6}$/i.test(result)) {
    throw appError('common.INVALID_PARAMS');
  }

  return result;
}

function values(input: Record<string, unknown>): TagValues {
  return {
    group: v.choice(input.group, groups),
    label: v.string(input.label).trim(),
    color: color(input.color),
    bgColor: color(input.bgColor),
    rounded: v.choice(input.rounded === undefined ? 0 : input.rounded, [0, 1]),
  };
}

export function list(input: unknown) {
  const query = params(input, ['page', 'size', 'group', 'search']);
  const page = v.positiveInteger(query.page === undefined ? 1 : query.page);
  const size = v.positiveInteger(query.size === undefined ? 10 : query.size);
  const group = query.group === undefined ? undefined : v.choice(query.group, groups);
  const search = query.search === undefined ? '' : v.string(query.search, true).trim();

  if (size > 100 || !Number.isSafeInteger(page * size)) {
    throw appError('common.INVALID_PARAMS');
  }

  return repository.pagination({ page, size, group, search });
}

export function get(input: unknown): TagRow {
  const query = params(input, ['id']);
  const row = repository.findById(v.string(query.id));

  if (!row) {
    throw appError('tags.NOT_FOUND');
  }

  return row;
}

export function update(input: unknown): TagRow {
  const query = params(input, ['id', ...fields]);
  const id = query.id === undefined ? undefined : v.string(query.id);
  const existing = id === undefined ? undefined : get({ id });
  const next = values({ ...existing, ...query });
  const changes: Partial<TagValues> = {};

  for (const field of fields) {
    if (Object.hasOwn(query, field)) {
      switch (field) {
        case 'group':
        case 'label':
        case 'color':
        case 'bgColor':
          changes[field] = next[field];
          break;
        case 'rounded':
          changes[field] = next[field];
          break;
      }
    }
  }

  if (existing && Object.keys(changes).length === 0) {
    return existing;
  }

  const row = id === undefined ? repository.create(next) : repository.update(id, changes);

  if (!row) {
    throw appError('tags.NOT_FOUND');
  }

  return row;
}

export function remove(input: unknown): { id: string } {
  const query = params(input, ['id']);
  const row = repository.remove(v.string(query.id));

  if (!row) {
    throw appError('tags.NOT_FOUND');
  }

  return { id: row.id };
}

const service = { list, get, update, remove };

export default service;
