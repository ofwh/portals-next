import 'server-only';
import { appError } from '@/lib/api';
import { SHORTCUT_ROUTES } from '@/lib/constants/shortcuts';
import { getAppContext } from '@/lib/context';
import repository from '@/lib/repositories/shortcuts';
import type { ShortcutRow, ShortcutValues } from '@/lib/repositories/shortcuts';
import type { RouteMatch } from '@/lib/types/route';
import type { ShortcutType } from '@/lib/types/shortcuts';
import config from './config';
import { createService } from './shared/crud';
import * as v from './shared/validation';

function validate(params: Record<string, unknown>) {
  return {
    type: v.choice(params.type, Object.keys(SHORTCUT_ROUTES) as ShortcutType[]),
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

export const { list, get } = service;

export function update(input: unknown) {
  const row = service.update(input);

  config.refresh();

  return row;
}

export function remove(input: unknown) {
  const row = service.remove(input);

  config.refresh();

  return row;
}

export function resolve(pathname: string): RouteMatch | null {
  const shortcuts = getAppContext().config.shortcuts;
  const types = Object.keys(SHORTCUT_ROUTES) as (keyof typeof SHORTCUT_ROUTES)[];
  const configured = types.map((type) => ({ type, ...shortcuts[type] }));
  const shortcut = configured
    .sort((left, right) => right.pathname.length - left.pathname.length)
    .find((item) => item.status && pathname.startsWith(item.pathname + '/'));

  if (!shortcut) {
    return null;
  }

  return { type: SHORTCUT_ROUTES[shortcut.type], pathname: pathname.slice(shortcut.pathname.length) };
}

const shortcuts = { ...service, update, remove, resolve };

export default shortcuts;
