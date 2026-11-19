'use client';

import { LoaderCircle, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { ListActionTrigger } from '@/components/business/list-actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function RouteDelete({
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
        setError(t('admin.routes.shared.deleteError'));
      }
    } catch (reason) {
      setError(reason instanceof Error && reason.message ? reason.message : t('admin.routes.shared.deleteError'));
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      modal
      disablePointerDismissal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!submitting && (!nextOpen || !disabled)) {
          setOpen(nextOpen);
          setError('');
        }
      }}
    >
      <Tooltip>
        <DialogTrigger
          render={
            <TooltipTrigger
              render={
                variant === 'link' ? (
                  <ListActionTrigger label={label} destructive disabled={disabled || submitting} />
                ) : (
                  <Button type="button" variant="destructive" disabled={disabled || submitting} aria-label={label} />
                )
              }
            />
          }
        >
          {variant === 'link' ? <Trash2 /> : label}
        </DialogTrigger>
        <TooltipContent side="top">{label}</TooltipContent>
      </Tooltip>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('shared.deleteTitle')}</DialogTitle>
          <DialogDescription className="break-words">{description}</DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" disabled={submitting} onClick={() => setOpen(false)}>
            {t('shared.cancel')}
          </Button>
          <Button type="button" disabled={submitting || disabled} onClick={() => void remove()}>
            {submitting && <LoaderCircle className="animate-spin" />}
            {t('shared.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
