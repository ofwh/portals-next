'use client';

import { ArrowLeft, Play, Square } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/business/page-header';
import { Button } from '@/components/ui/button';
import { useWorkflow, WorkflowContext } from '@/hooks/use-workflow';
import { createWorkflowStore } from '@/stores/workflow';
import { Canvas } from './canvas';
import { NodeList } from './node-list';

function Header({ name, description }: { name: string; description: string | null }) {
  const t = useTranslations();
  const {
    saving,
    running,
    run,
    stop,
    save: saveFlow,
    notifyError,
  } = useWorkflow((state) => ({
    saving: state.saving,
    running: state.running,
    run: state.run,
    stop: state.stop,
    save: state.save,
    notifyError: state.notifyError,
  }));

  async function save() {
    try {
      await saveFlow();
      toast.success(t('admin.application.subscriptions.flowEditor.saveSuccess'));
    } catch (error) {
      notifyError(error);
    }
  }

  return (
    <PageHeader
      titleId="workflow-title"
      title={name}
      description={description ?? ''}
      leading={
        <Button
          variant="outline"
          size="icon-sm"
          nativeButton={false}
          render={<Link href="/application/subscriptions" />}
          aria-label={t('admin.application.subscriptions.flowEditor.backToList')}
        >
          <ArrowLeft />
        </Button>
      }
    >
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={saving}
          onClick={() => (running ? stop() : void run().catch(notifyError))}
        >
          {running ? <Square /> : <Play />}
          {t(
            running
              ? 'admin.application.subscriptions.flowEditor.stop'
              : 'admin.application.subscriptions.flowEditor.run',
          )}
        </Button>
        <Button type="button" size="sm" disabled={saving || running} onClick={() => void save()}>
          {t('shared.save')}
        </Button>
      </div>
    </PageHeader>
  );
}

function WorkflowProvider({ id, children }: { id: string; children: ReactNode }) {
  const [store] = useState(() => createWorkflowStore(id));

  useEffect(() => {
    void store.getState().reload();

    return () => store.getState().cancelLoad();
  }, [store]);

  return <WorkflowContext.Provider value={store}>{children}</WorkflowContext.Provider>;
}

function EditorContent() {
  const t = useTranslations();
  const { subscription, flow, loading, error, refresh } = useWorkflow((state) => ({
    subscription: state.subscription,
    flow: state.flow,
    loading: state.detailLoading,
    error: state.detailError,
    refresh: state.loadDetail,
  }));

  return (
    <section
      aria-label={t('admin.application.subscriptions.flowEditor.title')}
      className="flex h-[calc(100dvh-5rem)] min-h-120 flex-col md:h-[calc(100dvh-7rem)]"
    >
      {error !== null ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 p-4">
          <p className="text-destructive text-sm">{error || t('admin.application.subscriptions.detailError')}</p>
          <Button type="button" variant="outline" disabled={loading} onClick={() => void refresh()}>
            {t('shared.retry')}
          </Button>
        </div>
      ) : subscription && flow ? (
        <>
          <Header name={subscription.name} description={subscription.description} />
          <div className="bg-background flex min-h-0 flex-1 overflow-hidden rounded-md border">
            <NodeList />
            <Canvas />
          </div>
        </>
      ) : (
        <div className="bg-muted h-full animate-pulse" aria-busy="true" />
      )}
    </section>
  );
}

export function WorkflowEditor({ id }: { id: string }) {
  return (
    <WorkflowProvider key={id} id={id}>
      <EditorContent />
    </WorkflowProvider>
  );
}
