'use client';

import { Check, Copy, FileInput, ListOrdered, TextAlignJustify, WrapText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { NodeRunState } from '@/lib/workflow/model';
import type { NodeManifest } from '@/lib/workflow/node/types';

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
  const inputValue = state.input?.length ? (input?.multiple === false ? state.input[0] : state.input) : undefined;
  const multipleInputs = input?.multiple !== false && state.input && state.input.length > 1 ? state.input : undefined;

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
        className="nodrag nopan flex h-[min(640px,85dvh)] max-h-[85dvh] w-[60%] max-w-[1280px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[1280px]"
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <DialogHeader className="shrink-0 border-b p-4 pr-12 sm:px-6 sm:pr-12">
          <DialogTitle>{t('runDetailsTitle')}</DialogTitle>
          <DialogDescription>
            {t.rich('runDetailsDescription', {
              name,
              node: (chunks) => (
                <Badge variant="secondary" className="h-auto max-w-full align-middle wrap-anywhere whitespace-normal">
                  {chunks}
                </Badge>
              ),
            })}
          </DialogDescription>
        </DialogHeader>
        <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1 p-6">
          <ResizablePanel defaultSize="50%" minSize="20%" className="min-w-0">
            {!state.input?.length ? (
              <div
                role="status"
                className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 p-3 text-sm"
              >
                <FileInput aria-hidden="true" className="size-8" />
                <p>{t('emptyRunInput')}</p>
              </div>
            ) : multipleInputs ? (
              <ResizablePanelGroup orientation="vertical" className="min-h-0">
                {multipleInputs.map((value, index) => {
                  const source = state.inputNodes?.[index];
                  const label = source?.name ?? `${t('runInput')} ${index + 1}`;

                  return (
                    <Fragment key={source?.nodeId ?? label}>
                      {index > 0 && <ResizableHandle withHandle className="my-3" />}
                      <ResizablePanel defaultSize={`${100 / multipleInputs.length}%`} className="min-h-0 min-w-0">
                        <RunDataPanel label={label} value={value} emptyLabel="" />
                      </ResizablePanel>
                    </Fragment>
                  );
                })}
              </ResizablePanelGroup>
            ) : (
              <RunDataPanel label={state.inputNodes?.[0]?.name ?? t('runInput')} value={inputValue} emptyLabel="" />
            )}
          </ResizablePanel>
          <ResizableHandle withHandle className="mx-3" />
          <ResizablePanel defaultSize="50%" minSize="20%" className="min-w-0">
            <RunDataPanel
              label={name}
              value={state.status === 'failed' ? state.error : state.output}
              emptyLabel={t('noRunData')}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </DialogContent>
    </Dialog>
  );
}

function RunDataPanel({ label, value, emptyLabel }: { label: string; value: unknown; emptyLabel: string }) {
  const t = useTranslations();
  const [wrapLines, setWrapLines] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const content =
    value === undefined
      ? emptyLabel
      : typeof value === 'string'
        ? value
        : JSON.stringify(value, null, 2).replace(/\\([\s\S])/g, (escape, character: string) =>
            character === 'n' ? '\n' : escape,
          );
  const lines = content.split('\n').map((text, index) => ({ text, number: index + 1 }));

  async function copyContent() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      if (copyTimeoutRef.current !== null) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 1000);
      toast.success(t('shared.copySuccess'));
    } catch {
      toast.error(t('shared.copyError'));
    }
  }

  return (
    <section aria-label={label} className="flex h-full min-h-0 min-w-0 flex-col gap-2">
      <h4 className="text-sm font-medium wrap-anywhere">{label}</h4>
      <div className="group/run-data bg-muted relative min-h-0 flex-1 overflow-hidden rounded-md">
        <ScrollArea className="h-full min-w-0">
          <pre
            className={`grid p-3 font-mono text-xs ${showLineNumbers ? 'grid-cols-[auto_minmax(0,1fr)] gap-x-3' : 'grid-cols-[minmax(0,1fr)]'} ${wrapLines ? 'w-full wrap-anywhere whitespace-pre-wrap' : 'w-max min-w-full whitespace-pre'}`}
          >
            {lines.map((line) => (
              <Fragment key={line.number}>
                {showLineNumbers && (
                  <span aria-hidden="true" className="text-muted-foreground border-r pr-3 text-right select-none">
                    {line.number}
                  </span>
                )}
                <span className="min-h-lh">{line.text}</span>
              </Fragment>
            ))}
          </pre>
          {!wrapLines && <ScrollBar orientation="horizontal" />}
        </ScrollArea>
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 transition-opacity group-focus-within/run-data:opacity-100 group-hover/run-data:opacity-100">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={t('admin.application.subscriptions.flowEditor.lineNumbers')}
            aria-pressed={showLineNumbers}
            className="bg-popover"
            onClick={() => setShowLineNumbers((current) => !current)}
          >
            <ListOrdered className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={t('admin.application.subscriptions.flowEditor.wrapLines')}
            aria-pressed={wrapLines}
            className="bg-popover"
            onClick={() => setWrapLines((current) => !current)}
          >
            {wrapLines ? <WrapText className="size-4" /> : <TextAlignJustify className="size-4" />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={t('shared.copy')}
            disabled={value === undefined}
            onClick={copyContent}
            className="bg-popover"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </Button>
        </div>
      </div>
    </section>
  );
}
