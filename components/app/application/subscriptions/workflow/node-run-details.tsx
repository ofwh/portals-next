'use client';

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { NodeRunState } from '@/lib/workflow/model';
import type { NodeManifest } from '@/lib/workflow/nodes/types';

export function NodeRunDetails({
  name,
  input,
  state,
  onClose,
}: {
  name: string;
  input: NodeManifest['input'] | undefined;
  state: NodeRunState;
  onClose(): void;
}) {
  const t = useTranslations('admin.application.subscriptions.flowEditor');
  const inputValue = input?.multiple === false ? state.input?.[0] : state.input;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="nodrag nopan flex max-h-[85dvh] flex-col sm:max-w-2xl"
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>{t('runDetails')}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 space-y-4 overflow-y-auto">
          {(['input', 'output'] as const).map((key) => {
            const value = key === 'input' ? inputValue : state.status === 'failed' ? state.error : state.output;

            return (
              <section key={key} className="space-y-2">
                <h3 className="text-sm font-medium">{t(key === 'input' ? 'runInput' : 'runOutput')}</h3>
                <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
                  {value === undefined ? t('noRunData') : JSON.stringify(value, null, 2)}
                </pre>
              </section>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
