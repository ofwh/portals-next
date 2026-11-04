'use client';

import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';
import { cn } from 'cn';
import { useTranslations } from 'next-intl';
import type { ComponentType, FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkflow } from '@/hooks/use-workflow';
import { cloneJson } from '@/lib/shared/data';
import type { NodeInstance } from '@/lib/workflow/model';
import { nodeViewRegistry } from '@/lib/workflow/node/client';
import type { NodeFormProps } from '@/lib/workflow/node/types';
import styles from '@/styles/ui.module.css';

interface NodeConfigEditorProps {
  node: NodeInstance;
  Form: ComponentType<NodeFormProps<unknown>>;
  className?: string;
  onClose(): void;
}

function NodeConfigEditor({ node, Form, className, onClose }: NodeConfigEditorProps) {
  const t = useTranslations();
  const { saving, updateConfig, notifyError } = useWorkflow((state) => ({
    saving: state.saving || state.running,
    updateConfig: state.updateConfig,
    notifyError: state.notifyError,
  }));
  const [draft, setDraft] = useState(() => cloneJson(node.config));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) {
      return;
    }

    try {
      updateConfig(node.id, draft);
      onClose();
    } catch (error) {
      notifyError(error);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !saving) {
          onClose();
        }
      }}
    >
      <DialogContent
        className={cn('flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl', className)}
        showCloseButton={!saving}
      >
        <DialogHeader className="shrink-0 border-b p-6 pr-12">
          <DialogTitle>{node.name}</DialogTitle>
          <DialogDescription>{t('admin.application.subscriptions.flowEditor.configHelp')}</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={submit} className={`flex min-h-0 flex-1 flex-col ${styles.highlight}`}>
          <ScrollArea className="flex min-h-0 flex-1 flex-col overflow-hidden [&>[data-slot=scroll-area-viewport]]:min-h-0 [&>[data-slot=scroll-area-viewport]]:overscroll-contain">
            <ScrollAreaPrimitive.Content className="p-6">
              <Form value={draft} disabled={saving} issues={[]} onChange={setDraft} />
            </ScrollAreaPrimitive.Content>
          </ScrollArea>
          <DialogFooter className="shrink-0 border-t p-4 sm:px-6">
            <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
              {t('shared.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {t('shared.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NodeConfig({ id, onClose }: { id: string | null; onClose(): void }) {
  const node = useWorkflow((state) => state.flow?.nodes.find((item) => item.id === id));
  const view = node ? nodeViewRegistry.getNodeView(node.type) : undefined;

  if (!node || !view?.config) {
    return null;
  }

  return (
    <NodeConfigEditor
      key={node.id}
      node={node}
      Form={view.config.Form}
      className={view.config.className}
      onClose={onClose}
    />
  );
}
