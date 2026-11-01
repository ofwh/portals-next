'use client';
import { Ban, Copy, ExternalLink, LoaderCircle, Play, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ComponentType } from 'react';
import { useRef, useState } from 'react';
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
import type { RedirectListItem } from '@/lib/types/routes';
import type { RouteDrawerProps } from './route-drawer';
import { RouteStatus } from './route-status';
import { RouteTable } from './route-table';

export function RedirectTable({
  drawer: Drawer,
  items,
  loading,
  initialLoading,
  filtered,
  onUpdated,
  statusActions,
  onRemove,
  selectedIds,
  onSelect,
  onSelectAll,
  actionsDisabled,
}: {
  drawer: ComponentType<RouteDrawerProps>;
  items: readonly RedirectListItem[];
  loading: boolean;
  initialLoading: boolean;
  filtered: boolean;
  onUpdated: () => void;
  statusActions: RouteStatusActions;
  onRemove: (id: string) => Promise<boolean>;
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
    <RouteTable mode="redirects" loading={loading} initialLoading={initialLoading}>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead className="w-12 px-4">
            <Checkbox
              aria-label={t('shared.selectAll')}
              checked={items.length > 0 && items.every((redirect) => selectedIds.includes(redirect.id))}
              indeterminate={selectedIds.length > 0 && selectedIds.length < items.length}
              disabled={actionsDisabled || items.length === 0}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead className="w-44">{t('shared.name')}</TableHead>
          <TableHead className="w-48">{t('admin.routes.shared.columns.pathname')}</TableHead>
          <TableHead>{t('admin.routes.redirects.shared.destination')}</TableHead>
          <TableHead className="w-20 text-center">{t('admin.routes.redirects.shared.statusCode')}</TableHead>
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
                {t(filtered ? 'admin.routes.redirects.emptyFiltered' : 'admin.routes.redirects.empty')}
              </p>
            </TableCell>
          </TableRow>
        ) : null}
        {items.map((redirect) => (
          <TableRow key={redirect.id}>
            <TableCell className="px-4">
              <Checkbox
                aria-label={t('shared.selectRow', { name: redirect.name })}
                checked={selectedIds.includes(redirect.id)}
                disabled={actionsDisabled}
                onCheckedChange={(checked) => onSelect(redirect.id, checked)}
              />
            </TableCell>
            <TableCell>
              <Tooltip disabled={!redirect.description}>
                <Drawer
                  id={redirect.id}
                  onSaved={onUpdated}
                  disabled={actionsDisabled}
                  triggerLabel={redirect.name}
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
                  {redirect.description}
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
                    {redirect.pathname}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="break-all">
                    {origin}
                    {redirect.pathname}
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
                        onClick={() => void copyPath(redirect.pathname)}
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
                href={redirect.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/destination focus-visible:ring-ring inline-flex max-w-64 items-center gap-1 rounded-sm text-sm outline-none focus-visible:ring-2"
                title={redirect.url}
                aria-label={t('admin.routes.redirects.openDestination', { url: redirect.url })}
              >
                <span className="min-w-0 truncate">{redirect.url}</span>
                <ExternalLink
                  aria-hidden="true"
                  className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover/destination:opacity-100 group-focus-visible/destination:opacity-100"
                />
              </a>
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="outline">{redirect.statusCode}</Badge>
            </TableCell>
            <TableCell>
              <TagList tags={redirect.tags} />
            </TableCell>
            <TableCell className="text-center">
              <RouteStatus
                enabled={redirect.status}
                label={t(redirect.status ? 'shared.enabled' : 'shared.disabled')}
              />
            </TableCell>
            <TableCell className="text-muted-foreground text-sm tabular-nums">
              {formatDateTime(redirect.updatedAt)}
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-center gap-1">
                <Drawer id={redirect.id} onSaved={onUpdated} disabled={actionsDisabled} />
                <RedirectStatusAction redirect={redirect} statusActions={statusActions} disabled={actionsDisabled} />
                <RemoveAction
                  label={t('shared.delete')}
                  description={t('admin.routes.redirects.deleteConfirmation', { name: redirect.name })}
                  onRemove={() => onRemove(redirect.id)}
                  disabled={actionsDisabled}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </RouteTable>
  );
}

function RedirectStatusAction({
  redirect,
  statusActions,
  disabled,
}: {
  redirect: RedirectListItem;
  statusActions: RouteStatusActions;
  disabled: boolean;
}) {
  const t = useTranslations();

  const [open, setOpen] = useState(false);
  const submitting = statusActions.pendingIds.has(redirect.id);
  const error = statusActions.errors[redirect.id] ?? '';

  function clearError() {
    statusActions.clearError(redirect.id);
  }

  async function changeStatus() {
    if (await statusActions.changeStatus(redirect.id)) {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      {redirect.status ? (
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
                {t('admin.routes.shared.disableConfirmation', { name: redirect.name })}
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

function RemoveAction({
  label,
  description,
  onRemove,
  disabled,
  variant = 'link',
}: {
  label: string;
  description: string;
  onRemove: () => Promise<boolean>;
  disabled: boolean;
  variant?: 'link' | 'destructive';
}) {
  const t = useTranslations();

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);

  async function remove() {
    if (pending.current || disabled) {
      return;
    }

    pending.current = true;
    setSubmitting(true);
    setError('');

    try {
      if (await onRemove()) {
        setOpen(false);
      } else {
        setError(t('admin.routes.redirects.deleteError'));
      }
    } catch (reason) {
      setError(reason instanceof Error && reason.message ? reason.message : t('admin.routes.redirects.deleteError'));
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (!submitting && (!nextOpen || !disabled)) {
          setOpen(nextOpen);
          setError('');
        }
      }}
    >
      <Tooltip>
        <PopoverTrigger
          render={
            <TooltipTrigger
              render={
                <Button
                  variant={variant === 'link' ? 'ghost' : variant}
                  size={variant === 'link' ? 'icon-sm' : 'default'}
                  className={variant === 'link' ? 'text-destructive' : undefined}
                  disabled={disabled || submitting}
                  aria-label={label}
                />
              }
            />
          }
        >
          {variant === 'link' ? <Trash2 /> : label}
        </PopoverTrigger>
        <TooltipContent side="top">{label}</TooltipContent>
      </Tooltip>
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
          <Button type="button" variant="outline" size="sm" disabled={submitting} onClick={() => setOpen(false)}>
            {t('shared.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={submitting || disabled}
            onClick={() => void remove()}
          >
            {submitting && <LoaderCircle className="animate-spin" />}
            {t('shared.delete')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
