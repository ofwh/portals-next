import { Suspense } from 'react';
import { WorkflowEditor } from '@/components/app/application/subscriptions/workflow/editor';

async function FlowContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <WorkflowEditor id={id} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="bg-muted h-[calc(100dvh-5rem)] animate-pulse md:h-[calc(100dvh-7rem)]" aria-busy="true" />
      }
    >
      <FlowContent params={params} />
    </Suspense>
  );
}
