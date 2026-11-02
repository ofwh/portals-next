'use client';

import { Blocks } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useWorkflow } from '@/hooks/use-workflow';
import type { useWorkflowCanvas } from '@/hooks/use-workflow-canvas';
import { NODE_PREVIEW_SIZE } from '@/lib/types/workflow-canvas';
import { nodeViewRegistry } from '@/lib/workflow/nodes/client';
import type { NodeGroup } from '@/lib/workflow/nodes/types';

export function NodePreview({ type, name }: { type: string; name: string }) {
  const Icon = nodeViewRegistry.getNodeView(type)?.icon ?? Blocks;

  return (
    <span className="flex h-full min-w-0 items-center gap-3 px-3 py-3 text-left">
      <Icon className="text-muted-foreground size-4 shrink-0" />
      <span className="truncate text-sm font-medium" title={name}>
        {name}
      </span>
    </span>
  );
}

type DragHandlers = Pick<ReturnType<typeof useWorkflowCanvas>, 'startDrag' | 'moveDrag' | 'dropDrag' | 'clearDrag'>;

function NodePalette({ groups, drag }: { groups: readonly NodeGroup[]; drag: DragHandlers }) {
  const saving = useWorkflow((state) => state.saving || state.running);

  return (
    <div className="mt-4 space-y-6">
      {groups.map((group) => (
        <section key={group.id} aria-label={group.name} className="space-y-3">
          <h3 className="text-muted-foreground text-xs font-medium">{group.name}</h3>
          <ul className="space-y-2">
            {group.nodes.map((node) => (
              <li key={node.type}>
                <button
                  type="button"
                  disabled={saving}
                  style={NODE_PREVIEW_SIZE}
                  onPointerDown={(event) => drag.startDrag(event, node.type)}
                  onPointerMove={drag.moveDrag}
                  onPointerUp={drag.dropDrag}
                  onPointerCancel={drag.clearDrag}
                  onLostPointerCapture={drag.clearDrag}
                  onDragStart={(event) => event.preventDefault()}
                  className="bg-background hover:bg-accent focus-visible:ring-ring block w-full min-w-0 cursor-grab touch-none rounded-md border text-left outline-none select-none focus-visible:ring-2 active:cursor-grabbing disabled:opacity-50"
                >
                  <NodePreview type={node.type} name={node.name} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function NodeList({ drag }: { drag: DragHandlers }) {
  const t = useTranslations();
  const { groups, loading, loaded, error, refresh } = useWorkflow((state) => ({
    groups: state.catalog.groups,
    loading: state.nodesLoading,
    loaded: state.nodesLoaded,
    error: state.nodesError,
    refresh: state.loadNodes,
  }));

  return (
    <aside
      aria-label={t('admin.application.subscriptions.flowEditor.nodes')}
      aria-busy={loading}
      className="bg-sidebar w-64 shrink-0 overflow-y-auto border-r p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-muted-foreground text-xs">{t('admin.application.subscriptions.flowEditor.nodes')}</h2>
        <Button type="button" variant="ghost" size="sm" disabled={loading} onClick={() => void refresh()}>
          {t('shared.refresh')}
        </Button>
      </div>
      {error !== null && (
        <p role="alert" className="text-destructive mt-4 text-sm">
          {error || t('admin.application.subscriptions.flowEditor.nodesError')}
        </p>
      )}
      {!loaded && loading ? (
        <div className="bg-muted mt-4 h-32 animate-pulse rounded-md" />
      ) : groups.length > 0 ? (
        <NodePalette groups={groups} drag={drag} />
      ) : (
        error === null && (
          <p role="status" className="text-muted-foreground mt-4 text-sm leading-6">
            {t('admin.application.subscriptions.flowEditor.noNodes')}
          </p>
        )
      )}
    </aside>
  );
}
