import 'server-only';
import { appError } from '@/lib/api';
import tags from '@/lib/repositories/tags';
import * as v from './validation';

export function validateTagIds(value: unknown, group: string): string[] | undefined {
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

  if (selected.length !== ids.length || selected.some((tag) => tag.group !== group)) {
    throw appError('common.INVALID_PARAMS');
  }

  return ids;
}
