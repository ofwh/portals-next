'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { usePagination } from '@/hooks/use-pagination';
import { ROUTE_TYPE } from '@/lib/constants';
import type { RouteMode } from '@/lib/constants/routes';
import {
  listCaches,
  listOriginals,
  listProxies,
  listRedirects,
  removeCache,
  removeOriginal,
  removeProxy,
  removeRedirect,
  updateCache,
  updateOriginal,
  updateProxy,
  updateRedirect,
} from '@/lib/requests/routes';
import type { Pagination } from '@/lib/types/pagination';
import type {
  CacheListItem,
  OriginalListItem,
  ProxyListItem,
  RedirectListItem,
  RouteListParams,
} from '@/lib/types/routes';

export interface RouteStatusActions {
  pendingIds: ReadonlySet<string>;
  errors: Readonly<Record<string, string>>;
  clearError: (id: string) => void;
  changeStatus: (id: string) => Promise<boolean>;
}

interface RouteListItems {
  [ROUTE_TYPE.PROXY]: ProxyListItem;
  [ROUTE_TYPE.REDIRECT]: RedirectListItem;
  [ROUTE_TYPE.CACHE]: CacheListItem;
  [ROUTE_TYPE.ORIGINAL]: OriginalListItem;
}

const clients: {
  [Type in RouteMode]: {
    list: (params: RouteListParams, signal: AbortSignal) => Promise<Pagination<RouteListItems[Type]>>;
    remove: (id: string) => Promise<void>;
    update: (input: { id: string; status: boolean }) => Promise<void>;
  };
} = {
  [ROUTE_TYPE.PROXY]: { list: listProxies, remove: removeProxy, update: updateProxy },
  [ROUTE_TYPE.REDIRECT]: { list: listRedirects, remove: removeRedirect, update: updateRedirect },
  [ROUTE_TYPE.CACHE]: { list: listCaches, remove: removeCache, update: updateCache },
  [ROUTE_TYPE.ORIGINAL]: { list: listOriginals, remove: removeOriginal, update: updateOriginal },
};

export function useRouteList<Type extends RouteMode>(type: Type) {
  const t = useTranslations('admin.routes.shared');
  const { list, remove, update } = clients[type];
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pending = useRef(new Set<string>());

  const pagination = usePagination<RouteListItems[Type], RouteListParams>({
    initialParams: { page: 1, size: 10, search: '', status: 'all' },
    list,
    remove,
  });

  function clearError(id: string) {
    setErrors((current) => {
      const next = { ...current };

      delete next[id];

      return next;
    });
  }

  async function changeStatus(id: string): Promise<boolean> {
    const { state, params, removing } = pagination;
    const snapshot = state.snapshot;

    if (pending.current.has(id) || removing || state.status === 'loading' || snapshot?.params !== params) {
      return false;
    }

    const route = snapshot.result.data.find((item) => item.id === id);

    if (!route) {
      return false;
    }

    pending.current.add(id);
    setPendingIds(new Set(pending.current));
    clearError(id);

    try {
      await update({ id, status: !route.status });
    } catch (reason) {
      const message = reason instanceof Error && reason.message ? reason.message : t('statusError');

      setErrors((current) => ({ ...current, [id]: message }));

      return false;
    } finally {
      pending.current.delete(id);
      setPendingIds(new Set(pending.current));
    }

    pagination.refresh();

    return true;
  }

  const statusActions: RouteStatusActions = { pendingIds, errors, clearError, changeStatus };

  return { ...pagination, statusActions };
}
