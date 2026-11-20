'use client';

import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';
import { cn } from 'cn';
import { Pencil } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Empty, EmptyDescription } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkflow } from '@/hooks/use-workflow';
import { resolveLocale } from '@/i18n/config';
import { cloneJson } from '@/lib/shared/data';
import type { NodeInstance } from '@/lib/workflow/model';
import { nodeViewRegistry } from '@/lib/workflow/node/client';
import type { ConfigIssue, NodeConfigResult, NodeConfigView } from '@/lib/workflow/node/types';
import styles from '@/styles/ui.module.css';

function useEmptyNodeConfig(): NodeConfigResult<unknown> {
  return { title: '', description: '' };
}

interface NodeConfigEditorProps {
  node: NodeInstance;
  useNodeConfig?: NodeConfigView<unknown>['useNodeConfig'];
  className?: string;
  onClose(): void;
}

function NodeConfigEditor({ node, useNodeConfig = useEmptyNodeConfig, className, onClose }: NodeConfigEditorProps) {
  const { title, description, ConfigForm } = useNodeConfig();
  const t = useTranslations();
  const locale = resolveLocale(useLocale());
  const { saving, updateNode, notifyError, manifest } = useWorkflow((state) => ({
    saving: state.saving || state.running,
    updateNode: state.updateNode,
    notifyError: state.notifyError,
    manifest: state.catalog.nodes.find((item) => item.type === node.type),
  }));
  const [editingName, setEditingName] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(node.displayName ?? '');
  const [issues, setIssues] = useState<ConfigIssue[]>([]);
  const [draft, setDraft] = useState(() => cloneJson(node.config));
  const originalName = title || (manifest?.nameKey ? t(manifest.nameKey) : node.name);

  useEffect(() => {
    if (editingName) {
      nameInput.current?.focus();
      nameInput.current?.select();
    }
  }, [editingName]);

  function saveName() {
    if (saving) {
      setEditingName(false);

      return;
    }

    try {
      updateNode(node.id, { displayName: displayName.trim() });
      setEditingName(false);
    } catch (error) {
      notifyError(error);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) {
      return;
    }

    try {
      const issues = nodeViewRegistry.getNodeView(node.type)?.config?.validate?.(draft, { locale }) ?? [];

      setIssues(issues);
      if (issues.length) {
        return;
      }

      updateNode(node.id, { config: draft });
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
        <DialogHeader className="shrink-0 border-b p-4 pr-12 sm:px-6 sm:pr-12">
          <div className="relative flex min-w-0 flex-col gap-2">
            {editingName && (
              <Input
                ref={nameInput}
                className="absolute inset-y-0 left-0 h-full w-3/4"
                name="displayName"
                aria-label={t('admin.application.subscriptions.flowEditor.displayName')}
                disabled={saving}
                value={displayName}
                placeholder={originalName}
                onChange={(event) => setDisplayName(event.target.value)}
                onBlur={saveName}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    event.currentTarget.blur();
                  } else if (event.key === 'Escape') {
                    event.preventDefault();
                    event.stopPropagation();
                    setEditingName(false);
                  }
                }}
              />
            )}
            <DialogTitle className={cn('group/node-title relative min-w-0 pr-8', editingName && 'invisible')}>
              <span className="relative inline-block max-w-full align-top">
                <span className="block truncate">{node.displayName?.trim() || originalName}</span>
                {!editingName && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 left-full ml-2 -translate-y-1/2 opacity-0 group-focus-within/node-title:opacity-100 group-hover/node-title:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                    disabled={saving}
                    aria-label={t('admin.application.subscriptions.flowEditor.editDisplayName')}
                    onClick={() => {
                      setDisplayName(node.displayName ?? '');
                      setEditingName(true);
                    }}
                  >
                    <Pencil />
                  </Button>
                )}
              </span>
            </DialogTitle>
            <DialogDescription className={cn('text-xs', editingName && 'invisible')}>{description}</DialogDescription>
          </div>
        </DialogHeader>
        <form noValidate onSubmit={submit} className={`flex min-h-0 flex-1 flex-col ${styles.highlight}`}>
          <ScrollArea className="flex min-h-0 flex-1 flex-col overflow-hidden [&>[data-slot=scroll-area-viewport]]:min-h-0 [&>[data-slot=scroll-area-viewport]]:overscroll-contain">
            <ScrollAreaPrimitive.Content className="p-6">
              {ConfigForm ? (
                <ConfigForm
                  value={draft}
                  disabled={saving}
                  issues={issues}
                  onChange={(value) => {
                    setDraft(value);
                    setIssues([]);
                  }}
                />
              ) : (
                <Empty>
                  <EmptyDescription>
                    {t('admin.application.subscriptions.flowEditor.noConfigurationHelp')}
                  </EmptyDescription>
                </Empty>
              )}
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

  if (!node) {
    return null;
  }

  return (
    <NodeConfigEditor
      key={node.id}
      node={node}
      useNodeConfig={view?.config?.useNodeConfig}
      className={view?.config?.className}
      onClose={onClose}
    />
  );
}
