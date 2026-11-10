'use client';
import { Ban, ExternalLink, LoaderCircle, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { ListActions, ListActionTrigger } from '@/components/business/list-actions';
import { PathnameLink } from '@/components/business/pathname-link';
import { TagList } from '@/components/business/tag-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePreferences } from '@/hooks/use-preferences';
import type { RouteStatusActions } from '@/hooks/use-route-list';
import { useRouteUrl } from '@/hooks/use-route-url';
import type { ProxyListItem } from '@/lib/types/routes';
import { RouteDelete } from '../route-delete';
import type { RouteDrawerProps } from '../route-drawer';
import { RouteStatus } from '../route-status';
import { RouteTable } from '../route-table';

export function ProxyTable({
  drawer: Drawer,
  items,
  loading,
  initialLoading,
  filtered,
  onUpdated,
  onRemove,
  statusActions,
  selectedIds,
  onSelect,
  onSelectAll,
  actionsDisabled,
}: {
  drawer: ComponentType<RouteDrawerProps>;
  items: readonly ProxyListItem[];
  loading: boolean;
  initialLoading: boolean;
  filtered: boolean;
  onUpdated: () => void;
  onRemove: (id: string) => Promise<boolean>;
  statusActions: RouteStatusActions;
  selectedIds: readonly string[];
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  actionsDisabled: boolean;
}) {
  const t = useTranslations();

  const formatDateTime = usePreferences((state) => state.formatDateTime);
  const getRouteUrl = useRouteUrl('proxy');

  return (
    <RouteTable mode="proxies" loading={loading} initialLoading={initialLoading}>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead className="w-12 max-w-12 min-w-12 px-4">
            <Checkbox
              aria-label={t('shared.selectAll')}
              checked={items.length > 0 && items.every((proxy) => selectedIds.includes(proxy.id))}
              indeterminate={selectedIds.length > 0 && selectedIds.length < items.length}
              disabled={actionsDisabled || items.length === 0}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead className="w-44">{t('shared.name')}</TableHead>
          <TableHead className="min-w-48">{t('admin.routes.shared.columns.pathname')}</TableHead>
          <TableHead>{t('admin.routes.proxies.columns.upstream')}</TableHead>
          <TableHead className="w-20">{t('admin.routes.proxies.columns.method')}</TableHead>
          <TableHead className="w-48">{t('shared.tags')}</TableHead>
          <TableHead className="w-24 text-center">{t('shared.status')}</TableHead>
          <TableHead className="w-44">{t('shared.updatedAt')}</TableHead>
          <TableHead className="w-24 max-w-24 min-w-24 text-center">{t('shared.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="h-24 text-center">
              <p role="status" className="font-medium">
                {t(filtered ? 'admin.routes.proxies.emptyFiltered' : 'admin.routes.proxies.empty')}
              </p>
            </TableCell>
          </TableRow>
        ) : null}
        {items.map((proxy) => (
          <TableRow key={proxy.id}>
            <TableCell className="w-12 max-w-12 min-w-12 px-4">
              <Checkbox
                aria-label={t('shared.selectRow', { name: proxy.name })}
                checked={selectedIds.includes(proxy.id)}
                disabled={actionsDisabled}
                onCheckedChange={(checked) => onSelect(proxy.id, checked)}
              />
            </TableCell>
            <TableCell>
              <Tooltip disabled={!proxy.description}>
                <Drawer
                  id={proxy.id}
                  onSaved={onUpdated}
                  disabled={actionsDisabled}
                  triggerLabel={proxy.name}
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
                  {proxy.description}
                </TooltipContent>
              </Tooltip>
            </TableCell>
            <TableCell>
              <PathnameLink pathname={proxy.pathname} href={getRouteUrl(proxy.pathname)} />
            </TableCell>
            <TableCell>
              <a
                href={proxy.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/upstream focus-visible:ring-ring inline-flex max-w-64 items-center gap-1 rounded-sm text-sm outline-none focus-visible:ring-2"
                title={proxy.url}
                aria-label={t('admin.routes.proxies.openUpstream', { url: proxy.url })}
              >
                <span className="min-w-0 truncate">{proxy.url}</span>
                <ExternalLink
                  aria-hidden="true"
                  className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover/upstream:opacity-100 group-focus-visible/upstream:opacity-100"
                />
              </a>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{proxy.method}</Badge>
            </TableCell>
            <TableCell>
              <TagList tags={proxy.tags} />
            </TableCell>
            <TableCell className="text-center">
              <RouteStatus enabled={proxy.status} label={t(proxy.status ? 'shared.enabled' : 'shared.disabled')} />
            </TableCell>
            <TableCell className="text-muted-foreground text-sm tabular-nums">
              {formatDateTime(proxy.updatedAt)}
            </TableCell>
            <TableCell className="w-24 max-w-24 min-w-24">
              <ListActions disabled={actionsDisabled}>
                <Drawer id={proxy.id} onSaved={onUpdated} disabled={actionsDisabled} />
                <Drawer copyFromId={proxy.id} onSaved={onUpdated} disabled={actionsDisabled} />
                <ProxyStatusAction proxy={proxy} statusActions={statusActions} disabled={actionsDisabled} />
                <RouteDelete
                  label={t('shared.delete')}
                  description={t('admin.routes.shared.deleteConfirmation', { name: proxy.name })}
                  disabled={actionsDisabled}
                  onRemove={() => onRemove(proxy.id)}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </RouteTable>
  );
}

function ProxyStatusAction({
  proxy,
  statusActions,
  disabled,
}: {
  proxy: ProxyListItem;
  statusActions: RouteStatusActions;
  disabled: boolean;
}) {
  const t = useTranslations();

  const [open, setOpen] = useState(false);
  const submitting = statusActions.pendingIds.has(proxy.id);
  const error = statusActions.errors[proxy.id] ?? '';

  function clearError() {
    statusActions.clearError(proxy.id);
  }

  async function changeStatus() {
    if (await statusActions.changeStatus(proxy.id)) {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      {proxy.status ? (
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            if (!submitting && (!nextOpen || !disabled)) {
              setOpen(nextOpen);
              clearError();
            }
          }}
        >
          <Tooltip>
            <DialogTrigger
              render={<TooltipTrigger render={<ListActionTrigger disabled={disabled} label={t('shared.disable')} />} />}
            >
              <Ban />
            </DialogTrigger>
            <TooltipContent side="top">{t('shared.disable')}</TooltipContent>
          </Tooltip>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>{t('admin.routes.shared.disableTitle')}</DialogTitle>
              <DialogDescription className="break-words">
                {t('admin.routes.shared.disableConfirmation', { name: proxy.name })}
              </DialogDescription>
            </DialogHeader>
            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button variant="outline" disabled={submitting} onClick={() => setOpen(false)}>
                {t('shared.cancel')}
              </Button>
              <Button disabled={submitting || disabled} onClick={() => void changeStatus()}>
                {submitting && <LoaderCircle className="animate-spin" />}
                {t('shared.disable')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <>
          <Tooltip>
            <TooltipTrigger
              render={
                <ListActionTrigger
                  disabled={submitting || disabled}
                  label={t('shared.enable')}
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
