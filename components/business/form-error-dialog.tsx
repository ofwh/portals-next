'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';

export function FormErrorDialog({ error, onClose }: { error: string; onClose: () => void }) {
  const t = useTranslations();

  return (
    <Dialog
      modal
      disablePointerDismissal
      open={Boolean(error)}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogPortal>
        <DialogOverlay forceRender />
      </DialogPortal>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('shared.formErrorTitle')}</DialogTitle>
          <DialogDescription className="break-words whitespace-pre-wrap">{error}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            {t('shared.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
