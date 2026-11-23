'use client';

import { Copy, LoaderCircle, Pencil, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { TagForm } from '@/components/app/settings/system/tag-form';
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
import { useTagForm } from '@/hooks/use-tag';
import styles from '@/styles/ui.module.css';

export function TagDrawer({
  tagId,
  copyFromId,
  onSaved,
  disabled = false,
  trigger,
  triggerLabel,
}: {
  tagId?: string;
  copyFromId?: string;
  onSaved: () => void;
  disabled?: boolean;
  trigger?: ReactElement;
  triggerLabel?: string;
}) {
  const t = useTranslations();

  const [open, setOpen] = useState(false);
  const {
    form,
    onChange,
    selectedGroups,
    setSelectedGroups,
    submitting,
    error,
    clearError,
    loadState,
    reset,
    cancelLoad,
    submit,
  } = useTagForm(
    () => {
      setOpen(false);
      onSaved();
    },
    tagId,
    copyFromId,
  );

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
      ) : tagId && !trigger ? (
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
            trigger ?? <Button variant={tagId ? 'link' : 'default'} size={tagId ? 'sm' : 'lg'} disabled={disabled} />
          }
        >
          {!tagId && <Plus />}
          {triggerLabel ?? (tagId ? t('shared.edit') : t('admin.settings.system.tags.create'))}
        </DrawerTrigger>
      )}
      <ResizableDrawerContent
        open={open}
        className="data-[swipe-axis=x]:w-full data-[swipe-axis=x]:max-w-160 data-[swipe-axis=x]:sm:w-1/2"
      >
        <DrawerHeader className="relative border-b p-6 pr-16">
          <DrawerTitle className="text-xl">
            {t(tagId ? 'admin.settings.system.tags.editTitle' : 'admin.settings.system.tags.newTitle')}
          </DrawerTitle>
          <DrawerDescription>
            {t(tagId ? 'admin.settings.system.tags.editDescription' : 'admin.settings.system.tags.newDescription')}
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
                {t('admin.settings.system.tags.shared.loading')}
              </div>
            ) : loadState === 'error' ? (
              <Button type="button" variant="outline" onClick={() => void reset()}>
                {t('shared.refresh')}
              </Button>
            ) : (
              <TagForm
                form={form}
                onChange={onChange}
                groupSelection={tagId ? undefined : { value: selectedGroups, onChange: setSelectedGroups }}
              />
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
              {tagId ? t('shared.save') : t('admin.settings.system.tags.create')}
            </Button>
          </DrawerFooter>
        </form>
        <FormErrorDialog error={error} onClose={clearError} />
      </ResizableDrawerContent>
    </Drawer>
  );
}
