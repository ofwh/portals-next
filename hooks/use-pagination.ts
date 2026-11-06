'use client';

import { useEffect, useRef, useState } from 'react';
import type { Pagination, PaginationParams } from '@/lib/types/pagination';

type ListSnapshot<Item, Params> = {
  result: Pagination<Item>;
  params: Params;
};

type ListState<Item, Params> =
  | { status: 'loading'; snapshot: ListSnapshot<Item, Params> | null }
  | { status: 'error'; snapshot: ListSnapshot<Item, Params> | null; message: string }
  | { status: 'success'; snapshot: ListSnapshot<Item, Params> };

export function usePagination<Item extends { id: string }, Params extends PaginationParams>({
  initialParams,
  list,
  remove,
}: {
  initialParams: Params;
  list: (params: Params, signal: AbortSignal) => Promise<Pagination<Item>>;
  remove: (id: string) => Promise<unknown>;
}) {
  const [params, setParams] = useState<Params>(initialParams);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<ListState<Item, Params>>({ status: 'loading', snapshot: null });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [removing, setRemoving] = useState(false);
  const pendingRemove = useRef(false);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    activeRequest.current = controller;

    async function load() {
      try {
        const result = await list(params, controller.signal);

        if (!controller.signal.aborted) {
          const lastPage = Math.max(1, Math.ceil(result.total / params.size));

          if (params.page > lastPage) {
            setSelectedIds([]);
            setParams((current) => (current === params ? { ...current, page: lastPage } : current));

            return;
          }

          setState({ status: 'success', snapshot: { result, params } });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setState((current) => ({
            status: 'error',
            snapshot: current.snapshot,
            message: error instanceof Error ? error.message : '',
          }));
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [params, revision, list]);

  function changeParams(changes: Partial<Params>) {
    activeRequest.current?.abort();
    setSelectedIds([]);
    setState((current) => ({ status: 'loading', snapshot: current.snapshot }));
    setParams((current) => ({ ...current, ...changes }));
  }

  function refresh() {
    activeRequest.current?.abort();
    setSelectedIds([]);
    setState((current) => ({ status: 'loading', snapshot: current.snapshot }));
    setRevision((current) => current + 1);
  }

  function select(id: string, checked: boolean) {
    if (
      removing ||
      state.status === 'loading' ||
      state.snapshot?.params !== params ||
      !state.snapshot.result.data.some((item) => item.id === id)
    ) {
      return;
    }

    setSelectedIds((current) =>
      checked ? [...new Set([...current, id])] : current.filter((selected) => selected !== id),
    );
  }

  function selectAll(checked: boolean) {
    if (!removing && state.status !== 'loading' && state.snapshot?.params === params) {
      setSelectedIds(checked ? state.snapshot.result.data.map((item) => item.id) : []);
    }
  }

  async function removeItems(requestedIds: readonly string[]) {
    if (pendingRemove.current || state.status === 'loading' || state.snapshot?.params !== params) {
      return;
    }

    const ids = state.snapshot.result.data.filter((item) => requestedIds.includes(item.id)).map((item) => item.id);

    if (!ids.length) {
      return;
    }

    pendingRemove.current = true;
    setRemoving(true);

    try {
      const results = await Promise.allSettled(ids.map((id) => remove(id)));
      const deleted = results.filter((result) => result.status === 'fulfilled').length;
      const failure = results.find((result) => result.status === 'rejected');

      if (deleted > 0) {
        const lastPage = Math.max(1, Math.ceil((state.snapshot.result.total - deleted) / params.size));

        setParams((current) => (current === params ? { ...current, page: Math.min(current.page, lastPage) } : current));
        refresh();
      }

      return {
        deleted,
        failed: ids.length - deleted,
        message: failure?.status === 'rejected' && failure.reason instanceof Error ? failure.reason.message : '',
      };
    } finally {
      pendingRemove.current = false;
      setRemoving(false);
    }
  }

  function removeSelected() {
    return removeItems(selectedIds);
  }

  function removeItem(id: string) {
    return removeItems([id]);
  }

  return { params, state, changeParams, refresh, selectedIds, select, selectAll, removing, removeSelected, removeItem };
}
