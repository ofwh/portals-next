'use client';

import { LoaderCircle, Pencil, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { FormEvent, ReactElement, ReactNode } from 'react';
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
import type { RouteMode } from '@/lib/constants/routes';
import styles from '@/styles/ui.module.css';

export interface RouteDrawerProps {
  id?: string;
  onSaved: () => void;
  disabled?: boolean;
  trigger?: ReactElement;
  triggerLabel?: string;
}

export function RouteDrawer({
  id,
  mode,
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
}: Omit<RouteDrawerProps, 'onSaved'> & {
  mode: RouteMode;
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
          {triggerLabel ?? (id ? t('shared.edit') : t(`admin.routes.${mode}.create`))}
        </DrawerTrigger>
      )}
      <DrawerContent className="data-[swipe-axis=x]:w-full data-[swipe-axis=x]:max-w-225 data-[swipe-axis=x]:sm:w-1/2">
        <DrawerHeader className="relative border-b p-6 pr-16">
          <DrawerTitle className="text-xl">
            {t(id ? `admin.routes.${mode}.editTitle` : `admin.routes.${mode}.newTitle`)}
          </DrawerTitle>
          <DrawerDescription>
            {t(id ? `admin.routes.${mode}.editDescription` : `admin.routes.${mode}.newDescription`)}
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
                {t(`admin.routes.${mode}.loading`)}
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
              {id ? t('shared.save') : t(`admin.routes.${mode}.create`)}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
