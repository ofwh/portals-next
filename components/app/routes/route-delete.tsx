'use client';

import { LoaderCircle, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
                <Button
                  type="button"
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
      </DialogContent>
    </Dialog>
  );
}
