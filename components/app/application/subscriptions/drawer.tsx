'use client';

import { Copy, LoaderCircle, Pencil, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { FormEvent, ReactNode } from 'react';
import type { SubscriptionDrawerProps } from '@/components/app/application/subscriptions/table';
import { FormErrorDialog } from '@/components/business/form-error-dialog';
import { ListActionTrigger } from '@/components/business/list-actions';
import { ResizableDrawerContent } from '@/components/business/resizable-drawer-content';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import styles from '@/styles/ui.module.css';

export function SubscriptionDrawer({
  id,
  copyFromId,
  disabled = false,
  trigger,
  triggerLabel,
  open,
  setOpen,
  submitting,
  error,
  clearError,
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
  clearError: () => void;
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
        if (submitting || Boolean(error) || (nextOpen && disabled)) {
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
      {copyFromId ? (
        <Tooltip>
          <DrawerTrigger
            render={<TooltipTrigger render={<ListActionTrigger disabled={disabled} label={t('shared.duplicate')} />} />}
          >
            <Copy />
          </DrawerTrigger>
          <TooltipContent side="top">{t('shared.duplicate')}</TooltipContent>
        </Tooltip>
      ) : id && !trigger ? (
        <Tooltip>
          <DrawerTrigger
            render={<TooltipTrigger render={<ListActionTrigger disabled={disabled} label={t('shared.edit')} />} />}
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
      <ResizableDrawerContent
        open={open}
        className="data-[swipe-axis=x]:w-full data-[swipe-axis=x]:max-w-225 data-[swipe-axis=x]:sm:w-1/2"
      >
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
            <Button variant="outline" type="button" disabled={submitting} onClick={close}>
              {t('shared.cancel')}
            </Button>
            <Button
              type="submit"
              aria-busy={submitting}
              disabled={submitting || disabled || Boolean(error) || loadState !== 'ready'}
            >
              {submitting && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
              {id ? t('shared.save') : t(`${namespace}.create`)}
            </Button>
          </DrawerFooter>
        </form>
        <FormErrorDialog error={error} onClose={clearError} />
      </ResizableDrawerContent>
    </Drawer>
  );
}
