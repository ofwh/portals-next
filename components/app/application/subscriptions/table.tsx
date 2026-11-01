'use client';

import { Ban, CircleCheck, CircleSlash, Copy, LoaderCircle, Play, Trash2, Workflow } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRef, useState } from 'react';
import type { ComponentType, ReactElement, ReactNode } from 'react';
import { toast } from 'sonner';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePreferences } from '@/hooks/use-preferences';
import type { SubscriptionListItem, SubscriptionStatusActions } from '@/lib/types/subscriptions';

export interface SubscriptionDrawerProps {
  id?: string;
  onSaved: () => void;
  disabled?: boolean;
  trigger?: ReactElement;
  triggerLabel?: string;
}

export function SubscriptionTable({
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
  drawer: ComponentType<SubscriptionDrawerProps>;
  items: readonly SubscriptionListItem[];
  loading: boolean;
  initialLoading: boolean;
  filtered: boolean;
  onUpdated: () => void;
  onRemove: (id: string) => Promise<void>;
  statusActions: SubscriptionStatusActions;
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
      toast.success(t('admin.application.subscriptions.copySuccess'));
    } catch {
      toast.error(t('shared.copyError'));
    }
  }

  return (
    <SubscriptionTableContainer loading={loading} initialLoading={initialLoading}>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead className="w-12 px-4">
            <Checkbox
              aria-label={t('shared.selectAll')}
              checked={items.length > 0 && items.every((subscription) => selectedIds.includes(subscription.id))}
              indeterminate={selectedIds.length > 0 && selectedIds.length < items.length}
              disabled={actionsDisabled || items.length === 0}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead className="w-44">{t('shared.name')}</TableHead>
          <TableHead className="w-48">{t('admin.application.subscriptions.columns.pathname')}</TableHead>
          <TableHead className="w-24 text-center">{t('shared.status')}</TableHead>
          <TableHead className="w-44">{t('shared.updatedAt')}</TableHead>
          <TableHead className="w-44 text-center">{t('shared.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              <p role="status" className="font-medium">
                {t(
                  filtered ? 'admin.application.subscriptions.emptyFiltered' : 'admin.application.subscriptions.empty',
                )}
              </p>
            </TableCell>
          </TableRow>
        ) : null}
        {items.map((subscription) => (
          <TableRow key={subscription.id}>
            <TableCell className="px-4">
              <Checkbox
                aria-label={t('shared.selectRow', { name: subscription.name })}
                checked={selectedIds.includes(subscription.id)}
                disabled={actionsDisabled}
                onCheckedChange={(checked) => onSelect(subscription.id, checked)}
              />
            </TableCell>
            <TableCell>
              <Tooltip disabled={!subscription.description}>
                <TooltipTrigger
                  render={
                    <Button
                      variant="link"
                      size="sm"
                      className="cursor-pointer px-0 font-medium hover:no-underline"
                      disabled={actionsDisabled}
                      nativeButton={false}
                      render={
                        <Link href={`/application/subscriptions/workflow/${encodeURIComponent(subscription.id)}`} />
                      }
                    />
                  }
                >
                  {subscription.name}
                </TooltipTrigger>
                <TooltipContent side="top" className="break-words whitespace-pre-wrap">
                  {subscription.description}
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
                    {subscription.pathname}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="break-all">
                    {origin}
                    {subscription.pathname}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                        aria-label={t('admin.application.subscriptions.copyPath')}
                        onClick={() => void copyPath(subscription.pathname)}
                      />
                    }
                  >
                    <Copy />
                  </TooltipTrigger>
                  <TooltipContent side="top">{t('admin.application.subscriptions.copyPath')}</TooltipContent>
                </Tooltip>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <SubscriptionStatus
                enabled={subscription.status}
                label={t(subscription.status ? 'shared.enabled' : 'shared.disabled')}
              />
            </TableCell>
            <TableCell className="text-muted-foreground text-sm tabular-nums">
              {formatDateTime(subscription.updatedAt)}
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={actionsDisabled}
                  nativeButton={false}
                  render={<Link href={`/application/subscriptions/workflow/${encodeURIComponent(subscription.id)}`} />}
                  aria-label={t('admin.application.subscriptions.configure')}
                >
                  <Workflow />
                </Button>
                <Drawer id={subscription.id} onSaved={onUpdated} disabled={actionsDisabled} />
                <SubscriptionStatusAction
                  subscription={subscription}
                  statusActions={statusActions}
                  disabled={actionsDisabled}
                />
                <SubscriptionDelete
                  disabled={actionsDisabled}
                  name={subscription.name}
                  onConfirm={() => onRemove(subscription.id)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </SubscriptionTableContainer>
  );
}

function SubscriptionStatusAction({
  subscription,
  statusActions,
  disabled,
}: {
  subscription: SubscriptionListItem;
  statusActions: SubscriptionStatusActions;
  disabled: boolean;
}) {
  const t = useTranslations();

  const [open, setOpen] = useState(false);
  const submitting = statusActions.pendingIds.has(subscription.id);
  const error = statusActions.errors[subscription.id] ?? '';

  function clearError() {
    statusActions.clearError(subscription.id);
  }

  async function changeStatus() {
    if (await statusActions.changeStatus(subscription.id)) {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      {subscription.status ? (
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
              <PopoverTitle>{t('admin.application.subscriptions.disableTitle')}</PopoverTitle>
              <PopoverDescription className="break-words">
                {t('admin.application.subscriptions.disableConfirmation', { name: subscription.name })}
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

function SubscriptionTableContainer({
  loading,
  initialLoading,
  children,
}: {
  loading: boolean;
  initialLoading: boolean;
  children: ReactNode;
}) {
  const t = useTranslations();
  const namespace = 'admin.application.subscriptions';

  return (
    <div className="relative overflow-hidden rounded-md border">
      {loading && !initialLoading && (
        <div
          role="progressbar"
          aria-label={t(`${namespace}.loading`)}
          className="bg-primary/10 pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden"
        >
          <div className="bg-primary animate-loading-progress h-full w-[35%] motion-reduce:w-full motion-reduce:animate-none" />
        </div>
      )}
      {initialLoading ? (
        <div
          role="status"
          aria-busy={loading}
          className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm"
        >
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          {t(`${namespace}.loading`)}
        </div>
      ) : (
        <Table className="min-w-275" aria-busy={loading}>
          {children}
        </Table>
      )}
    </div>
  );
}

function SubscriptionStatus({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span role="img" aria-label={label} className="inline-flex align-middle" />}>
        {enabled ? (
          <CircleCheck aria-hidden="true" className="size-5 text-green-500 dark:text-green-400" />
        ) : (
          <CircleSlash aria-hidden="true" className="text-muted-foreground size-5" />
        )}
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

export function SubscriptionDelete({
  disabled,
  name,
  label,
  onConfirm,
}: {
  disabled: boolean;
  name?: string;
  label?: string;
  onConfirm: () => Promise<void>;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);

  async function confirm() {
    if (pending.current || disabled) {
      return;
    }

    pending.current = true;
    setSubmitting(true);
    setError('');
    try {
      await onConfirm();
      setOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('admin.application.subscriptions.deleteError'));
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        if (!submitting) {
          setOpen(value);
          setError('');
        }
      }}
    >
      {label ? (
        <PopoverTrigger render={<Button variant="destructive" disabled={disabled} />}>{label}</PopoverTrigger>
      ) : (
        <Tooltip>
          <PopoverTrigger
            render={
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive"
                    disabled={disabled}
                    aria-label={t('shared.delete')}
                  />
                }
              />
            }
          >
            <Trash2 />
          </PopoverTrigger>
          <TooltipContent side="top">{t('shared.delete')}</TooltipContent>
        </Tooltip>
      )}
      <PopoverContent side="top" align="center">
        <PopoverHeader>
          <PopoverTitle>{t('admin.application.subscriptions.deleteTitle')}</PopoverTitle>
          <PopoverDescription>
            {name
              ? t('admin.application.subscriptions.deleteConfirmation', { name })
              : t('admin.application.subscriptions.deleteSelectedConfirmation')}
          </PopoverDescription>
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
            disabled={disabled || submitting}
            onClick={() => void confirm()}
          >
            {submitting && <LoaderCircle className="animate-spin" />}
            {t('shared.delete')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
