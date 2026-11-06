'use client';

import { LoaderCircle, Pencil, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { toast } from 'sonner';
import { SubscriptionForm } from '@/components/app/application/subscription-form';
import { SubscriptionDelete, SubscriptionTable } from '@/components/app/application/subscriptions/table';
import type { SubscriptionDrawerProps } from '@/components/app/application/subscriptions/table';
import { ListPagination } from '@/components/business/list-pagination';
import { ListToolbar } from '@/components/business/list-toolbar';
import { PageHeader } from '@/components/business/page-header';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSubscriptionForm } from '@/hooks/use-subscription-form';
import { useSubscriptionList } from '@/hooks/use-subscription-list';
import styles from '@/styles/ui.module.css';

function EditDrawer({ id, onSaved, ...props }: SubscriptionDrawerProps) {
  const [open, setOpen] = useState(false);
  const { form, onChange, ...controller } = useSubscriptionForm(() => {
    setOpen(false);
    onSaved();
  }, id);

  return (
    <SubscriptionDrawer {...props} {...controller} id={id} open={open} setOpen={setOpen}>
      <SubscriptionForm form={form} onChange={onChange} />
    </SubscriptionDrawer>
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
    removeItem,
  } = useSubscriptionList();
  const loading = state.status === 'loading';
  const snapshot = state.snapshot;
  const actionsDisabled = loading || removing || snapshot?.params !== params;

  useEffect(() => {
    if (state.status === 'error' && state.snapshot) {
      toast.error(state.message || t('admin.application.subscriptions.loadError'));
    }
  }, [state, t]);

  async function deleteSelected() {
    const result = await removeSelected();

    if (!result) {
      return;
    }

    if (result.failed > 0) {
      throw new Error(
        result.message ||
          t('admin.application.subscriptions.deleteSelectedError', { deleted: result.deleted, failed: result.failed }),
      );
    }

    toast.success(t('admin.application.subscriptions.deleteSelectedSuccess', { count: result.deleted }));
  }

  async function deleteItem(id: string) {
    const result = await removeItem(id);

    if (result?.failed) {
      throw new Error(result.message || t('admin.application.subscriptions.deleteError'));
    }

    if (result?.deleted) {
      toast.success(t('admin.application.subscriptions.deleteSuccess'));
    }
  }

  return (
    <section className="mx-auto w-full max-w-375 lg:p-2" aria-labelledby="subscriptions-title">
      <PageHeader
        titleId="subscriptions-title"
        title={t('admin.application.subscriptions.title')}
        description={t('admin.application.subscriptions.description')}
      >
        <EditDrawer
          disabled={loading || removing}
          onSaved={() => changeParams({ page: 1 })}
          triggerLabel={t('shared.new')}
        />
      </PageHeader>
      <div className="flex flex-col gap-4">
        <ListToolbar
          searchPlaceholder={t('admin.application.subscriptions.searchPlaceholder')}
          search={params.search ?? ''}
          status={params.status ?? 'all'}
          loading={loading}
          onSearch={(search) => changeParams({ search, page: 1 })}
          onStatusChange={(status) => changeParams({ status, page: 1 })}
          onRefresh={refresh}
          refreshDisabled={loading || removing}
          actions={
            selectedIds.length > 0 && (
              <SubscriptionDelete
                disabled={actionsDisabled}
                label={t('shared.deleteSelected', { count: selectedIds.length })}
                onConfirm={deleteSelected}
              />
            )
          }
        />
        {state.status === 'error' && !snapshot ? (
          <Alert variant="destructive">
            <AlertTitle>{t('admin.application.subscriptions.loadError')}</AlertTitle>
            <AlertDescription>{state.message || t('shared.loadErrorDescription')}</AlertDescription>
            <AlertAction>
              <Button variant="outline" onClick={refresh}>
                {t('shared.refresh')}
              </Button>
            </AlertAction>
          </Alert>
        ) : (
          <SubscriptionTable
            drawer={EditDrawer}
            onRemove={deleteItem}
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

function SubscriptionDrawer({
  id,
  disabled = false,
  trigger,
  triggerLabel,
  open,
  setOpen,
  submitting,
  error,
  loadState,
  reset,
  cancelLoad,
  submit,
  children,
}: Omit<SubscriptionDrawerProps, 'onSaved'> & {
  open: boolean;
  setOpen: (open: boolean) => void;
  submitting: boolean;
  error: string;
  loadState: 'loading' | 'ready' | 'error';
  reset: () => Promise<void>;
  cancelLoad: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  children: ReactNode;
}) {
  const t = useTranslations();
  const namespace = 'admin.application.subscriptions';

  function close() {
    cancelLoad();
    setOpen(false);
  }

  return (
    <Drawer
      swipeDirection="right"
      open={open}
      onOpenChange={(nextOpen) => {
        if (submitting || (nextOpen && disabled)) {
          return;
        }

        if (nextOpen) {
          void reset();
        } else {
          cancelLoad();
        }

        setOpen(nextOpen);
      }}
    >
      {id && !trigger ? (
        <Tooltip>
          <DrawerTrigger
            render={
              <TooltipTrigger
                render={<Button variant="ghost" size="icon-sm" disabled={disabled} aria-label={t('shared.edit')} />}
              />
            }
          >
            <Pencil />
          </DrawerTrigger>
          <TooltipContent side="top">{t('shared.edit')}</TooltipContent>
        </Tooltip>
      ) : (
        <DrawerTrigger
          render={
            trigger ?? (
              <Button
                variant={id ? 'link' : 'default'}
                className="hover:no-underline"
                size={id ? 'sm' : 'lg'}
                disabled={disabled}
              />
            )
          }
        >
          {!id && <Plus />}
          {triggerLabel ?? (id ? t('shared.edit') : t(`${namespace}.create`))}
        </DrawerTrigger>
      )}
      <DrawerContent className="data-[swipe-axis=x]:w-full data-[swipe-axis=x]:max-w-225 data-[swipe-axis=x]:sm:w-1/2">
        <DrawerHeader className="relative border-b p-6 pr-16">
          <DrawerTitle className="text-xl">{t(id ? `${namespace}.editTitle` : `${namespace}.newTitle`)}</DrawerTitle>
          <DrawerDescription>
            {t(id ? `${namespace}.editDescription` : `${namespace}.newDescription`)}
          </DrawerDescription>
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-5 right-5"
            disabled={submitting}
            onClick={close}
            aria-label={t('shared.close')}
          >
            <X />
          </Button>
        </DrawerHeader>
        <form className={`flex min-h-0 flex-1 flex-col ${styles.highlight}`} onSubmit={submit}>
          <fieldset
            disabled={submitting || disabled}
            className="flex min-h-0 min-w-0 flex-1 flex-col gap-8 overflow-y-auto p-6"
          >
            {loadState === 'loading' ? (
              <div role="status" className="text-muted-foreground flex items-center justify-center gap-2 py-12">
                <LoaderCircle className="size-4 animate-spin" />
                {t(`${namespace}.loading`)}
              </div>
            ) : loadState === 'error' ? (
              <Button type="button" variant="outline" onClick={() => void reset()}>
                {t('shared.refresh')}
              </Button>
            ) : (
              children
            )}
          </fieldset>
          <DrawerFooter className="border-t p-4 sm:flex-row sm:items-center sm:justify-end">
            {error && (
              <p role="alert" className="text-destructive mr-auto text-sm">
                {error}
              </p>
            )}
            <Button variant="outline" type="button" disabled={submitting} onClick={close}>
              {t('shared.cancel')}
            </Button>
            <Button type="submit" disabled={submitting || disabled || loadState !== 'ready'}>
              {submitting && <LoaderCircle className="animate-spin" />}
              {id ? t('shared.save') : t(`${namespace}.create`)}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
