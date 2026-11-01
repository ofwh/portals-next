'use client';
import { Ban, Copy, ExternalLink, LoaderCircle, Play, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { TagList } from '@/components/business/tag-list';
import { Badge } from '@/components/ui/badge';
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
import type { CacheListItem } from '@/lib/types/routes';
import type { RouteDrawerProps } from './route-drawer';
import { RouteStatus } from './route-status';
import { RouteTable } from './route-table';

export function CacheTable({
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
  items: readonly CacheListItem[];
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
    <RouteTable mode="caches" loading={loading} initialLoading={initialLoading}>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead className="w-12 px-4">
            <Checkbox
              aria-label={t('shared.selectAll')}
              checked={items.length > 0 && items.every((cache) => selectedIds.includes(cache.id))}
              indeterminate={selectedIds.length > 0 && selectedIds.length < items.length}
              disabled={actionsDisabled || items.length === 0}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead className="w-44">{t('shared.name')}</TableHead>
          <TableHead className="w-48">{t('admin.routes.shared.columns.pathname')}</TableHead>
          <TableHead>{t('admin.routes.caches.columns.upstream')}</TableHead>
          <TableHead className="w-20">{t('admin.routes.caches.columns.method')}</TableHead>
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
                {t(filtered ? 'admin.routes.caches.emptyFiltered' : 'admin.routes.caches.empty')}
              </p>
            </TableCell>
          </TableRow>
        ) : null}
        {items.map((cache) => (
          <TableRow key={cache.id}>
            <TableCell className="px-4">
              <Checkbox
                aria-label={t('shared.selectRow', { name: cache.name })}
                checked={selectedIds.includes(cache.id)}
                disabled={actionsDisabled}
                onCheckedChange={(checked) => onSelect(cache.id, checked)}
              />
            </TableCell>
            <TableCell>
              <Tooltip disabled={!cache.description}>
                <Drawer
                  id={cache.id}
                  onSaved={onUpdated}
                  disabled={actionsDisabled}
                  triggerLabel={cache.name}
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
                  {cache.description}
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
                    {cache.pathname}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="break-all">
                    {origin}
                    {cache.pathname}
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
                        onClick={() => void copyPath(cache.pathname)}
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
              <a
                href={cache.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/upstream focus-visible:ring-ring inline-flex max-w-64 items-center gap-1 rounded-sm text-sm outline-none focus-visible:ring-2"
                title={cache.url}
                aria-label={t('admin.routes.caches.openUpstream', { url: cache.url })}
              >
                <span className="min-w-0 truncate">{cache.url}</span>
                <ExternalLink
                  aria-hidden="true"
                  className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover/upstream:opacity-100 group-focus-visible/upstream:opacity-100"
                />
              </a>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{cache.method}</Badge>
            </TableCell>
            <TableCell>
              <TagList tags={cache.tags} />
            </TableCell>
            <TableCell className="text-center">
              <RouteStatus enabled={cache.status} label={t(cache.status ? 'shared.enabled' : 'shared.disabled')} />
            </TableCell>
            <TableCell className="text-muted-foreground text-sm tabular-nums">
              {formatDateTime(cache.updatedAt)}
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-center gap-1">
                <Drawer id={cache.id} onSaved={onUpdated} disabled={actionsDisabled} />
                <CacheStatusAction cache={cache} statusActions={statusActions} disabled={actionsDisabled} />
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

function CacheStatusAction({
  cache,
  statusActions,
  disabled,
}: {
  cache: CacheListItem;
  statusActions: RouteStatusActions;
  disabled: boolean;
}) {
  const t = useTranslations();

  const [open, setOpen] = useState(false);
  const submitting = statusActions.pendingIds.has(cache.id);
  const error = statusActions.errors[cache.id] ?? '';

  function clearError() {
    statusActions.clearError(cache.id);
  }

  async function changeStatus() {
    if (await statusActions.changeStatus(cache.id)) {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      {cache.status ? (
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
                {t('admin.routes.shared.disableConfirmation', { name: cache.name })}
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
