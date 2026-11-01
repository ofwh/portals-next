'use client';
import { Ban, Copy, LoaderCircle, Play, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { TagList } from '@/components/business/tag-list';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePreferences } from '@/hooks/use-preferences';
import type { RouteStatusActions } from '@/hooks/use-route-list';
import type { OriginalListItem } from '@/lib/types/routes';
import type { RouteDrawerProps } from './route-drawer';
import { RouteStatus } from './route-status';
import { RouteTable } from './route-table';

export function OriginalTable({
  drawer: Drawer,
  items,
  loading,
  initialLoading,
  filtered,
  onUpdated,
  statusActions,
  selectedIds,
  onSelect,
  onSelectAll,
  actionsDisabled,
}: {
  drawer: ComponentType<RouteDrawerProps>;
  items: readonly OriginalListItem[];
  loading: boolean;
  initialLoading: boolean;
  filtered: boolean;
  onUpdated: () => void;
  statusActions: RouteStatusActions;
  selectedIds: readonly string[];
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  actionsDisabled: boolean;
}) {
  const t = useTranslations();

  const formatDateTime = usePreferences((state) => state.formatDateTime);
  const [origin, setOrigin] = useState('');

  async function copyPath(pathname: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${pathname}`);
      toast.success(t('admin.routes.shared.copySuccess'));
    } catch {
      toast.error(t('shared.copyError'));
    }
  }

  return (
    <RouteTable mode="originals" loading={loading} initialLoading={initialLoading}>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead className="w-12 px-4">
            <Checkbox
              aria-label={t('shared.selectAll')}
              checked={items.length > 0 && items.every((original) => selectedIds.includes(original.id))}
              indeterminate={selectedIds.length > 0 && selectedIds.length < items.length}
              disabled={actionsDisabled || items.length === 0}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead className="w-44">{t('shared.name')}</TableHead>
          <TableHead className="w-48">{t('admin.routes.shared.columns.pathname')}</TableHead>
          <TableHead>{t('admin.routes.originals.form.contentType')}</TableHead>
          <TableHead className="w-20">{t('admin.routes.originals.form.language')}</TableHead>
          <TableHead className="w-48">{t('shared.tags')}</TableHead>
          <TableHead className="w-24 text-center">{t('shared.status')}</TableHead>
          <TableHead className="w-44">{t('shared.updatedAt')}</TableHead>
          <TableHead className="w-44 text-center">{t('shared.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="h-24 text-center">
              <p role="status" className="font-medium">
                {t(filtered ? 'admin.routes.originals.emptyFiltered' : 'admin.routes.originals.empty')}
              </p>
            </TableCell>
          </TableRow>
        ) : null}
        {items.map((original) => (
          <TableRow key={original.id}>
            <TableCell className="px-4">
              <Checkbox
                aria-label={t('shared.selectRow', { name: original.name })}
                checked={selectedIds.includes(original.id)}
                disabled={actionsDisabled}
                onCheckedChange={(checked) => onSelect(original.id, checked)}
              />
            </TableCell>
            <TableCell>
              <Tooltip disabled={!original.description}>
                <Drawer
                  id={original.id}
                  onSaved={onUpdated}
                  disabled={actionsDisabled}
                  triggerLabel={original.name}
                  trigger={
                    <TooltipTrigger
                      render={
                        <Button
                          variant="link"
                          size="sm"
                          className="cursor-pointer px-0 font-medium hover:no-underline"
                          disabled={actionsDisabled}
                        />
                      }
                    />
                  }
                />
                <TooltipContent side="top" className="break-words whitespace-pre-wrap">
                  {original.description}
                </TooltipContent>
              </Tooltip>
            </TableCell>
            <TableCell>
              <div className="group inline-flex w-fit items-center gap-1.5">
                <Tooltip
                  onOpenChange={(open) => {
                    if (open) {
                      setOrigin(window.location.origin);
                    }
                  }}
                >
                  <TooltipTrigger render={<Button variant="link" size="sm" className="px-0 hover:no-underline" />}>
                    {original.pathname}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="break-all">
                    {origin}
                    {original.pathname}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                        aria-label={t('admin.routes.shared.copyPath')}
                        onClick={() => void copyPath(original.pathname)}
                      />
                    }
                  >
                    <Copy />
                  </TooltipTrigger>
                  <TooltipContent side="top">{t('admin.routes.shared.copyPath')}</TooltipContent>
                </Tooltip>
              </div>
            </TableCell>
            <TableCell>
              <span className="block max-w-64 truncate" title={original.contentType}>
                {original.contentType}
              </span>
            </TableCell>
            <TableCell>{original.language}</TableCell>
            <TableCell>
              <TagList tags={original.tags} />
            </TableCell>
            <TableCell className="text-center">
              <RouteStatus
                enabled={original.status}
                label={t(original.status ? 'shared.enabled' : 'shared.disabled')}
              />
            </TableCell>
            <TableCell className="text-muted-foreground text-sm tabular-nums">
              {formatDateTime(original.updatedAt)}
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-center gap-1">
                <Drawer id={original.id} onSaved={onUpdated} disabled={actionsDisabled} />
                <OriginalStatusAction original={original} statusActions={statusActions} disabled={actionsDisabled} />
                <Tooltip>
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
                  <TooltipContent side="top">{t('shared.delete')}</TooltipContent>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </RouteTable>
  );
}

function OriginalStatusAction({
  original,
  statusActions,
  disabled,
}: {
  original: OriginalListItem;
  statusActions: RouteStatusActions;
  disabled: boolean;
}) {
  const t = useTranslations();

  const [open, setOpen] = useState(false);
  const submitting = statusActions.pendingIds.has(original.id);
  const error = statusActions.errors[original.id] ?? '';

  function clearError() {
    statusActions.clearError(original.id);
  }

  async function changeStatus() {
    if (await statusActions.changeStatus(original.id)) {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      {original.status ? (
        <Popover
          open={open}
          onOpenChange={(nextOpen) => {
            if (!submitting && (!nextOpen || !disabled)) {
              setOpen(nextOpen);
              clearError();
            }
          }}
        >
          <Tooltip>
            <PopoverTrigger
              render={
                <TooltipTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" disabled={disabled} aria-label={t('shared.disable')} />
                  }
                />
              }
            >
              <Ban />
            </PopoverTrigger>
            <TooltipContent side="top">{t('shared.disable')}</TooltipContent>
          </Tooltip>
          <PopoverContent side="top" align="center">
            <PopoverHeader>
              <PopoverTitle>{t('admin.routes.shared.disableTitle')}</PopoverTitle>
              <PopoverDescription className="break-words">
                {t('admin.routes.shared.disableConfirmation', { name: original.name })}
              </PopoverDescription>
            </PopoverHeader>
            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" disabled={submitting} onClick={() => setOpen(false)}>
                {t('shared.cancel')}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={submitting || disabled}
                onClick={() => void changeStatus()}
              >
                {submitting && <LoaderCircle className="animate-spin" />}
                {t('shared.disable')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={submitting || disabled}
                  aria-label={t('shared.enable')}
                  onClick={() => void changeStatus()}
                />
              }
            >
              {submitting ? <LoaderCircle className="animate-spin" /> : <Play />}
            </TooltipTrigger>
            <TooltipContent side="top">{t('shared.enable')}</TooltipContent>
          </Tooltip>
          {error && (
            <p role="alert" className="text-destructive max-w-48 text-xs whitespace-normal">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
