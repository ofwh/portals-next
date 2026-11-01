'use client';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { usePagination } from '@/hooks/use-pagination';
import { listSubscriptions, removeSubscription, updateSubscription } from '@/lib/requests/subscriptions';
import type { SubscriptionStatusActions } from '@/lib/types/subscriptions';
import type { SubscriptionListItem, SubscriptionListParams } from '@/lib/types/subscriptions';

export function useSubscriptionList() {
  const t = useTranslations('admin.application.subscriptions');

  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pending = useRef(new Set<string>());

  const pagination = usePagination<SubscriptionListItem, SubscriptionListParams>({
    initialParams: { page: 1, size: 10, search: '', status: 'all' },
    list: listSubscriptions,
    remove: removeSubscription,
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

    const subscription = snapshot.result.data.find((item) => item.id === id);

    if (!subscription) {
      return false;
    }

    pending.current.add(id);
    setPendingIds(new Set(pending.current));
    clearError(id);

    try {
      await updateSubscription({ id, status: !subscription.status });
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

  const statusActions: SubscriptionStatusActions = { pendingIds, errors, clearError, changeStatus };

  return { ...pagination, statusActions };
}
