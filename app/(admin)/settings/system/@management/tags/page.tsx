'use client';

import { ChevronLeft, ChevronRight, LoaderCircle, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TagForm } from '@/components/app/settings/system/tag-form';
import { TagBadge } from '@/components/business/tag-badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePreferences } from '@/hooks/use-preferences';
import { useTagForm, useTagList } from '@/hooks/use-tag';
import { TAG_GROUPS } from '@/lib/constants/tags';
import type { TagDetail } from '@/lib/types/tag';
import styles from '@/styles/ui.module.css';

type DeleteResult = { success: boolean; message?: string };

export default function Page() {
  const t = useTranslations();

  const { params, state, changeParams, refresh, selectedIds, select, selectAll, removing, removeSelected, removeItem } =
    useTagList();
  const loading = state.status === 'loading';
  const snapshot = state.snapshot;
  const actionsDisabled = loading || removing || snapshot?.params !== params;

  useEffect(() => {
    if (state.status === 'error' && state.snapshot) {
      toast.error(state.message || t('admin.settings.system.tags.loadError'));
    }
  }, [state, t]);

  async function deleteSelected(): Promise<DeleteResult> {
    const result = await removeSelected();

    if (!result) {
      return { success: false };
    }

    if (result.failed > 0) {
      const message = t('admin.settings.system.tags.deleteSelectedError', {
        deleted: result.deleted,
        failed: result.failed,
      });

      toast.error(message);

      return { success: false, message };
    }

    toast.success(t('admin.settings.system.tags.deleteSelectedSuccess', { count: result.deleted }));

    return { success: true };
  }

  async function deleteTag(tag: TagDetail): Promise<DeleteResult> {
    const result = await removeItem(tag.id);

    if (!result) {
      return { success: false };
    }

    if (result.failed > 0) {
      return { success: false, message: result.message || t('admin.settings.system.tags.deleteError') };
    }

    toast.success(t('admin.settings.system.tags.deleteSuccess', { name: tag.label }));

    return { success: true };
  }

  return (
    <section className="w-full" aria-labelledby="system-tags-title">
      <ListHeader disabled={loading || removing} onCreated={() => changeParams({ page: 1 })} />
      <div className="flex flex-col gap-4">
        <ListToolbar
          search={params.search ?? ''}
          group={params.group ?? 'all'}
          loading={loading}
          onSearch={(search) => changeParams({ search, page: 1 })}
          onGroupChange={(group) => changeParams({ group: group === 'all' ? undefined : group, page: 1 })}
          onRefresh={refresh}
          selectedCount={selectedIds.length}
          removing={removing}
          onDeleteSelected={deleteSelected}
        />
        {state.status === 'error' && !snapshot ? (
          <div
            role="alert"
            className="border-destructive/30 flex items-center justify-between gap-4 rounded-md border p-4"
          >
            <div>
              <p className="text-destructive text-sm font-medium">{t('admin.settings.system.tags.loadError')}</p>
              <p className="text-muted-foreground mt-1 text-sm">{state.message || t('shared.loadErrorDescription')}</p>
            </div>
            <Button variant="outline" onClick={refresh}>
              {t('shared.refresh')}
            </Button>
          </div>
        ) : (
          <ListTable
            tags={snapshot?.result.data ?? []}
            loading={loading}
            initialLoading={loading && !snapshot}
            filtered={Boolean(snapshot?.params.search) || Boolean(snapshot?.params.group)}
            onUpdated={refresh}
            selectedIds={selectedIds}
            onSelect={select}
            onSelectAll={selectAll}
            actionsDisabled={actionsDisabled}
            removing={removing}
            onDelete={deleteTag}
          />
        )}
        {snapshot && snapshot.result.total > 0 && (
          <ListPagination
            total={snapshot.result.total}
            page={snapshot.result.page}
            size={snapshot.result.size}
            disabled={actionsDisabled}
            onPageChange={(page) => changeParams({ page })}
            onSizeChange={(size) => changeParams({ size, page: 1 })}
          />
        )}
      </div>
    </section>
  );
}

function ListHeader({ onCreated, disabled }: { onCreated: () => void; disabled: boolean }) {
  const t = useTranslations('admin.settings.system.tags');

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 id="system-tags-title" className="text-lg font-semibold">
          {t('title')}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">{t('description')}</p>
      </div>
      <TagDrawer onSaved={onCreated} disabled={disabled} />
    </div>
  );
}

function TagDrawer({
  tagId,
  onSaved,
  disabled = false,
  trigger,
  triggerLabel,
}: {
  tagId?: string;
  onSaved: () => void;
  disabled?: boolean;
  trigger?: ReactElement;
  triggerLabel?: string;
}) {
  const t = useTranslations();

  const [open, setOpen] = useState(false);
  const { form, onChange, submitting, error, loadState, reset, cancelLoad, submit } = useTagForm(() => {
    setOpen(false);
    onSaved();
  }, tagId);

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
      {tagId && !trigger ? (
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
            trigger ?? <Button variant={tagId ? 'link' : 'default'} size={tagId ? 'sm' : 'lg'} disabled={disabled} />
          }
        >
          {!tagId && <Plus />}
          {triggerLabel ?? (tagId ? t('shared.edit') : t('admin.settings.system.tags.create'))}
        </DrawerTrigger>
      )}
      <DrawerContent className="data-[swipe-axis=x]:w-full data-[swipe-axis=x]:max-w-160 data-[swipe-axis=x]:sm:w-1/2">
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
              <TagForm form={form} onChange={onChange} />
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
              {tagId ? t('shared.save') : t('admin.settings.system.tags.create')}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

interface ListToolbarProps {
  search: string;
  group: string;
  loading: boolean;
  onSearch: (search: string) => void;
  onGroupChange: (group: string) => void;
  onRefresh: () => void;
  selectedCount: number;
  removing: boolean;
  onDeleteSelected: () => Promise<DeleteResult>;
}

function ListToolbar({
  search,
  group,
  loading,
  onSearch,
  onGroupChange,
  onRefresh,
  selectedCount,
  removing,
  onDeleteSelected,
}: ListToolbarProps) {
  const t = useTranslations();

  const [searchInput, setSearchInput] = useState(search);

  const groups = [
    { value: 'all', label: t('admin.settings.system.tags.allGroups') },
    ...TAG_GROUPS.map((group) => ({ value: group.value, label: t(group.label) })),
  ];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch(searchInput.trim());
        }}
      >
        <div className="relative w-full sm:w-80">
          <Input
            className="pr-10"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t('admin.settings.system.tags.searchPlaceholder')}
            aria-label={t('admin.settings.system.tags.searchPlaceholder')}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-0.5 -translate-y-1/2"
            aria-label={t('shared.search')}
          >
            <Search />
          </Button>
        </div>
        <Select
          value={group}
          items={groups}
          onValueChange={(value) => {
            if (value !== null) {
              onGroupChange(value);
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-36" aria-label={t('admin.settings.system.tags.shared.group')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="bottom" alignItemWithTrigger={false}>
            {groups.map((group) => (
              <SelectItem key={group.value} value={group.value}>
                {group.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </form>
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <TagDeleteConfirmation
            description={t('admin.settings.system.tags.deleteSelectedConfirmation', { count: selectedCount })}
            trigger={
              <Button variant="destructive" disabled={loading || removing}>
                {t('shared.deleteSelected', { count: selectedCount })}
              </Button>
            }
            disabled={loading || removing}
            pending={removing}
            onConfirm={onDeleteSelected}
          />
        )}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                disabled={loading || removing}
                onClick={onRefresh}
                aria-label={t('shared.refresh')}
              />
            }
          >
            <RefreshCw className={loading ? 'animate-spin' : undefined} />
          </TooltipTrigger>
          <TooltipContent side="top">{t('shared.refresh')}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function ListTable({
  tags,
  loading,
  initialLoading,
  filtered,
  onUpdated,
  selectedIds,
  onSelect,
  onSelectAll,
  actionsDisabled,
  removing,
  onDelete,
}: {
  tags: readonly TagDetail[];
  loading: boolean;
  initialLoading: boolean;
  filtered: boolean;
  onUpdated: () => void;
  selectedIds: readonly string[];
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  actionsDisabled: boolean;
  removing: boolean;
  onDelete: (tag: TagDetail) => Promise<DeleteResult>;
}) {
  const t = useTranslations();

  const formatDateTime = usePreferences((state) => state.formatDateTime);

  return (
    <div className="relative overflow-hidden rounded-md border">
      {loading && !initialLoading && (
        <div
          role="progressbar"
          aria-label={t('admin.settings.system.tags.shared.loading')}
          className="bg-primary/10 pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden"
        >
          <div className="bg-primary animate-loading-progress h-full w-[35%] motion-reduce:w-full motion-reduce:animate-none" />
        </div>
      )}
      {initialLoading && (
        <span role="status" className="sr-only">
          {t('admin.settings.system.tags.shared.loading')}
        </span>
      )}
      <Table className="min-w-180 table-auto" aria-busy={loading}>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="min-w-12 px-4">
              <Checkbox
                aria-label={t('shared.selectAll')}
                checked={tags.length > 0 && tags.every((tag) => selectedIds.includes(tag.id))}
                indeterminate={selectedIds.length > 0 && selectedIds.length < tags.length}
                disabled={actionsDisabled || tags.length === 0}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead className="min-w-44">{t('shared.name')}</TableHead>
            <TableHead className="min-w-40">{t('admin.settings.system.tags.shared.group')}</TableHead>
            <TableHead className="min-w-48">{t('admin.settings.system.tags.shared.preview')}</TableHead>
            <TableHead className="min-w-48">{t('shared.updatedAt')}</TableHead>
            <TableHead className="min-w-32 text-center">{t('shared.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialLoading ? (
            [0, 1, 2, 3, 4].map((row) => (
              <TableRow key={row} aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map((column) => (
                  <TableCell key={column}>
                    <Skeleton className={column === 0 ? 'size-4' : 'h-4 w-24'} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : tags.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <p role="status" className="font-medium">
                  {t(filtered ? 'admin.settings.system.tags.shared.empty' : 'admin.settings.system.tags.empty')}
                </p>
              </TableCell>
            </TableRow>
          ) : null}
          {tags.map((tag) => {
            const group = TAG_GROUPS.find((group) => group.value === tag.group);

            return (
              <TableRow key={tag.id}>
                <TableCell className="px-4">
                  <Checkbox
                    aria-label={t('shared.selectRow', { name: tag.label })}
                    checked={selectedIds.includes(tag.id)}
                    disabled={actionsDisabled}
                    onCheckedChange={(checked) => onSelect(tag.id, checked)}
                  />
                </TableCell>
                <TableCell>
                  <TagDrawer
                    tagId={tag.id}
                    onSaved={onUpdated}
                    disabled={actionsDisabled}
                    triggerLabel={tag.label}
                    trigger={
                      <Button
                        variant="link"
                        size="sm"
                        className="max-w-64 cursor-pointer px-0 font-medium"
                        disabled={actionsDisabled}
                      />
                    }
                  />
                </TableCell>
                <TableCell>{group ? t(group.label) : tag.group}</TableCell>
                <TableCell>
                  <div className="max-w-48">
                    <TagBadge tag={tag} />
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm tabular-nums">
                  {formatDateTime(tag.updatedAt)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TagDrawer tagId={tag.id} onSaved={onUpdated} disabled={actionsDisabled} />
                    <Tooltip>
                      <TagDeleteConfirmation
                        description={t('admin.settings.system.tags.deleteConfirmation', { name: tag.label })}
                        trigger={
                          <TooltipTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive"
                                disabled={actionsDisabled}
                                aria-label={t('shared.delete')}
                              />
                            }
                          >
                            <Trash2 />
                          </TooltipTrigger>
                        }
                        disabled={actionsDisabled}
                        pending={removing}
                        onConfirm={() => onDelete(tag)}
                      />
                      <TooltipContent side="top">{t('shared.delete')}</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function TagDeleteConfirmation({
  description,
  trigger,
  disabled,
  pending,
  onConfirm,
}: {
  description: string;
  trigger: ReactElement;
  disabled: boolean;
  pending: boolean;
  onConfirm: () => Promise<DeleteResult>;
}) {
  const t = useTranslations();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    if (pending || disabled) {
      return;
    }

    setError('');

    try {
      const result = await onConfirm();

      if (result.success) {
        setOpen(false);
      } else {
        setError(result.message || t('admin.settings.system.tags.deleteError'));
      }
    } catch (reason) {
      setError(
        reason instanceof Error && reason.message ? reason.message : t('admin.settings.system.tags.deleteError'),
      );
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending && (!nextOpen || !disabled)) {
          setOpen(nextOpen);
          setError('');
        }
      }}
    >
      <PopoverTrigger render={trigger} />
      <PopoverContent side="top" align="center">
        <PopoverHeader>
          <PopoverTitle>{t('shared.deleteTitle')}</PopoverTitle>
          <PopoverDescription className="break-words">{description}</PopoverDescription>
        </PopoverHeader>
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" disabled={pending} onClick={() => setOpen(false)}>
            {t('shared.cancel')}
          </Button>
          <Button variant="destructive" size="sm" disabled={pending || disabled} onClick={() => void confirm()}>
            {pending && <LoaderCircle className="animate-spin" />}
            {t('shared.delete')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ListPaginationProps {
  total: number;
  page: number;
  size: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  disabled: boolean;
}

function ListPagination({ total, page, size, onPageChange, onSizeChange, disabled }: ListPaginationProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
      <span className="text-muted-foreground text-sm">{t('shared.total', { count: total })}</span>
      <nav className="flex items-center gap-1" aria-label={t('shared.pagination')}>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t('shared.previousPage')}
        >
          <ChevronLeft />
        </Button>
        <Button variant="outline" size="icon-sm" aria-current="page" disabled={disabled}>
          {page}
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={disabled || page * size >= total}
          onClick={() => onPageChange(page + 1)}
          aria-label={t('shared.nextPage')}
        >
          <ChevronRight />
        </Button>
      </nav>
      <Select
        disabled={disabled}
        value={String(size)}
        onValueChange={(value) => {
          if (value !== null) {
            onSizeChange(Number(value));
          }
        }}
        items={[10, 20, 50].map((size) => ({ value: String(size), label: t('shared.pageSize', { count: size }) }))}
      >
        <SelectTrigger size="sm" aria-label={t('shared.rowsPerPage')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent side="bottom" alignItemWithTrigger={false}>
          {[10, 20, 50].map((size) => (
            <SelectItem key={size} value={String(size)}>
              {t('shared.pageSize', { count: size })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
