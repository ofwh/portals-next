'use client';

import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { RedirectForm } from '@/components/app/routes/redirects/form';
import { RedirectTable } from '@/components/app/routes/redirects/table';
import { RouteDrawer } from '@/components/app/routes/route-drawer';
import type { RouteDrawerProps } from '@/components/app/routes/route-drawer';
import { RouteHeader } from '@/components/app/routes/route-header';
import { RouteToolbar } from '@/components/app/routes/route-toolbar';
import { ListPagination } from '@/components/business/list-pagination';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRouteForm } from '@/hooks/use-route-form';
import { useRouteList } from '@/hooks/use-route-list';
import { ROUTE_TYPE } from '@/lib/constants';

function EditDrawer({ id, onSaved, ...props }: RouteDrawerProps) {
  const [open, setOpen] = useState(false);
  const { form, onChange, ...controller } = useRouteForm(
    ROUTE_TYPE.REDIRECT,
    () => {
      setOpen(false);
      onSaved();
    },
    id,
  );

  return (
    <RouteDrawer {...props} {...controller} id={id} mode="redirects" open={open} setOpen={setOpen}>
      <RedirectForm form={form} onChange={onChange} />
    </RouteDrawer>
  );
}

export default function Page() {
  const t = useTranslations();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const pendingDelete = useRef(false);

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
    removeItem,
  } = useRouteList(ROUTE_TYPE.REDIRECT);
  const loading = state.status === 'loading';
  const snapshot = state.snapshot;
  const actionsDisabled = loading || removing || snapshot?.params !== params;

  useEffect(() => {
    if (state.status === 'error' && state.snapshot) {
      toast.error(state.message || t('admin.routes.redirects.loadError'));
    }
  }, [state, t]);

  async function deleteSelected() {
    const result = await removeSelected();

    if (!result) {
      return false;
    }

    if (result.failed > 0) {
      toast.error(t('admin.routes.shared.deleteSelectedError', { deleted: result.deleted, failed: result.failed }));
    } else {
      toast.success(t('admin.routes.shared.deleteSelectedSuccess', { count: result.deleted }));
    }

    return result.failed === 0;
  }

  async function deleteRoute(id: string): Promise<boolean> {
    const result = await removeItem(id);

    if (!result || result.failed > 0) {
      return false;
    }

    toast.success(t('admin.routes.shared.deleteSuccess'));

    return true;
  }

  async function confirmDeleteSelected() {
    if (pendingDelete.current || loading || removing) {
      return;
    }

    pendingDelete.current = true;
    setDeleting(true);
    setDeleteError('');
    try {
      if (await deleteSelected()) {
        setDeleteOpen(false);
      } else {
        setDeleteError(t('admin.routes.shared.deleteError'));
      }
    } catch (reason) {
      setDeleteError(reason instanceof Error && reason.message ? reason.message : t('admin.routes.shared.deleteError'));
    } finally {
      pendingDelete.current = false;
      setDeleting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-375 lg:p-2" aria-labelledby="redirects-title">
      <RouteHeader mode="redirects">
        <EditDrawer
          disabled={loading || removing}
          onSaved={() => changeParams({ page: 1 })}
          triggerLabel={t('shared.new')}
        />
      </RouteHeader>
      <div className="flex flex-col gap-4">
        <RouteToolbar
          mode="redirects"
          search={params.search ?? ''}
          status={params.status ?? 'all'}
          loading={loading}
          onSearch={(search) => changeParams({ search, page: 1 })}
          onStatusChange={(status) => changeParams({ status, page: 1 })}
          onRefresh={refresh}
          selectedCount={selectedIds.length}
          removing={removing}
          deleteAction={
            <Dialog
              open={deleteOpen}
              onOpenChange={(open) => {
                if (!deleting && (!open || (!loading && !removing))) {
                  setDeleteOpen(open);
                  setDeleteError('');
                }
              }}
            >
              <DialogTrigger render={<Button variant="destructive" disabled={loading || removing || deleting} />}>
                {t('shared.deleteSelected', { count: selectedIds.length })}
              </DialogTrigger>
              <DialogContent showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>{t('shared.deleteTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('admin.routes.shared.deleteSelectedConfirmation', { count: selectedIds.length })}
                  </DialogDescription>
                </DialogHeader>
                {deleteError && (
                  <p role="alert" className="text-destructive text-sm">
                    {deleteError}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={deleting}
                    onClick={() => setDeleteOpen(false)}
                  >
                    {t('shared.cancel')}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={deleting || loading || removing}
                    onClick={() => void confirmDeleteSelected()}
                  >
                    {deleting && <LoaderCircle className="animate-spin" />}
                    {t('shared.delete')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />
        {state.status === 'error' && !snapshot ? (
          <Alert variant="destructive">
            <AlertTitle>{t('admin.routes.redirects.loadError')}</AlertTitle>
            <AlertDescription>{state.message || t('shared.loadErrorDescription')}</AlertDescription>
            <AlertAction>
              <Button variant="outline" onClick={refresh}>
                {t('shared.refresh')}
              </Button>
            </AlertAction>
          </Alert>
        ) : (
          <RedirectTable
            drawer={EditDrawer}
            items={snapshot?.result.data ?? []}
            loading={loading}
            initialLoading={loading && !snapshot}
            filtered={Boolean(snapshot?.params.search) || (snapshot?.params.status ?? 'all') !== 'all'}
            onUpdated={refresh}
            statusActions={statusActions}
            onRemove={deleteRoute}
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
