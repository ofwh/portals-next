import 'server-only';
import { appError } from '@/lib/api';
import repository from '@/lib/repositories/shortcuts';
import type { ShortcutRow, ShortcutValues } from '@/lib/repositories/shortcuts';
import { createService } from './crud';
import * as v from './validation';

function validate(params: Record<string, unknown>) {
  return {
    type: v.choice(params.type, ['proxy', 'redirect', 'cache', 'original']),
    pathname: v.pathname(params.pathname),
    status: v.boolean(params.status),
  };
}

const service = createService<ShortcutRow, ShortcutValues>(
  repository,
  validate,
  {
    notFound: 'shortcuts.NOT_FOUND',
    pathExist: 'shortcuts.PATH_EXIST',
    typeExist: 'shortcuts.TYPE_EXIST',
  },
  (values, id) => {
    const duplicate = repository.findByType(values.type);

    if (duplicate && duplicate.id !== id) {
      throw appError('shortcuts.TYPE_EXIST');
    }
  },
);

export const { list, get, update, remove } = service;

export default service;
