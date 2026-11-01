'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { OriginalForm } from '@/components/app/routes/original-form';
import { OriginalTable } from '@/components/app/routes/original-table';
import { RouteDrawer } from '@/components/app/routes/route-drawer';
import type { RouteDrawerProps } from '@/components/app/routes/route-drawer';
import { RouteHeader } from '@/components/app/routes/route-header';
import { RouteToolbar } from '@/components/app/routes/route-toolbar';
import { ListPagination } from '@/components/business/list-pagination';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouteForm } from '@/hooks/use-route-form';
import { useRouteList } from '@/hooks/use-route-list';
import { ROUTE_TYPE } from '@/lib/constants';

function EditDrawer({ id, onSaved, ...props }: RouteDrawerProps) {
  const [open, setOpen] = useState(false);
  const { form, onChange, ...controller } = useRouteForm(
    ROUTE_TYPE.ORIGINAL,
    () => {
      setOpen(false);
      onSaved();
    },
    id,
  );

  return (
    <RouteDrawer {...props} {...controller} id={id} mode="originals" open={open} setOpen={setOpen}>
      <OriginalForm form={form} onChange={onChange} />
    </RouteDrawer>
  );
}

export default function Page() {
  const t = useTranslations();

  const {
    params,
    state,
    changeParams,
    refresh,
    selectedIds,
    select,
    selectAll,
    removing,
    statusActions,
    removeSelected,
  } = useRouteList(ROUTE_TYPE.ORIGINAL);
  const loading = state.status === 'loading';
  const snapshot = state.snapshot;
  const actionsDisabled = loading || removing || snapshot?.params !== params;

  useEffect(() => {
    if (state.status === 'error' && state.snapshot) {
      toast.error(state.message || t('admin.routes.originals.loadError'));
    }
  }, [state, t]);

  async function deleteSelected() {
    const result = await removeSelected();

    if (!result) {
      return;
    }

    if (result.failed > 0) {
      toast.error(t('admin.routes.shared.deleteSelectedError', { deleted: result.deleted, failed: result.failed }));
    } else {
      toast.success(t('admin.routes.shared.deleteSelectedSuccess', { count: result.deleted }));
    }
  }

  return (
    <section className="mx-auto w-full max-w-375 lg:p-2" aria-labelledby="originals-title">
      <RouteHeader mode="originals">
        <EditDrawer
          disabled={loading || removing}
          onSaved={() => changeParams({ page: 1 })}
          triggerLabel={t('shared.new')}
        />
      </RouteHeader>
      <div className="flex flex-col gap-4">
        <RouteToolbar
          mode="originals"
          search={params.search ?? ''}
          status={params.status ?? 'all'}
          loading={loading}
          onSearch={(search) => changeParams({ search, page: 1 })}
          onStatusChange={(status) => changeParams({ status, page: 1 })}
          onRefresh={refresh}
          selectedCount={selectedIds.length}
          removing={removing}
          onDeleteSelected={() => void deleteSelected()}
        />
        {state.status === 'error' && !snapshot ? (
          <Alert variant="destructive">
            <AlertTitle>{t('admin.routes.originals.loadError')}</AlertTitle>
            <AlertDescription>{state.message || t('shared.loadErrorDescription')}</AlertDescription>
            <AlertAction>
              <Button variant="outline" onClick={refresh}>
                {t('shared.refresh')}
              </Button>
            </AlertAction>
          </Alert>
        ) : (
          <OriginalTable
            drawer={EditDrawer}
            items={snapshot?.result.data ?? []}
            loading={loading}
            initialLoading={loading && !snapshot}
            filtered={Boolean(snapshot?.params.search) || (snapshot?.params.status ?? 'all') !== 'all'}
            onUpdated={refresh}
            statusActions={statusActions}
            selectedIds={selectedIds}
            onSelect={select}
            onSelectAll={selectAll}
            actionsDisabled={actionsDisabled}
          />
        )}
        {snapshot && (
          <ListPagination
            page={snapshot.result.page}
            size={snapshot.result.size}
            total={snapshot.result.total}
            disabled={actionsDisabled}
            onChange={changeParams}
          />
        )}
      </div>
    </section>
  );
}
