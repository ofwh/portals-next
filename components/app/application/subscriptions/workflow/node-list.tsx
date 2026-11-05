'use client';

import { Blocks, RotateCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useWorkflow } from '@/hooks/use-workflow';
import type { useWorkflowCanvas } from '@/hooks/use-workflow-canvas';
import { NODE_PREVIEW_SIZE } from '@/lib/types/workflow-canvas';
import { nodeViewRegistry } from '@/lib/workflow/node/client';
import type { NodeGroup } from '@/lib/workflow/node/types';

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
  const t = useTranslations();
  const saving = useWorkflow((state) => state.saving || state.running);

  return (
    <div className="mt-4 space-y-6">
      {groups.map((group) => (
        <section key={group.id} aria-label={group.nameKey ? t(group.nameKey) : group.name} className="space-y-3">
          <h3 className="text-muted-foreground text-xs font-medium">{group.nameKey ? t(group.nameKey) : group.name}</h3>
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
                  <NodePreview type={node.type} name={node.nameKey ? t(node.nameKey) : node.name} />
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

  const [spinning, setSpinning] = useState(false);
  const refreshIcon = useRef<SVGSVGElement>(null);
  const activeAnimation = useRef<Animation | null>(null);

  useEffect(
    () => () => {
      activeAnimation.current?.cancel();
      activeAnimation.current = null;
    },
    [],
  );

  async function handleRefresh() {
    const icon = refreshIcon.current;

    if (loading || spinning || !icon || activeAnimation.current) {
      return;
    }

    const duration = 1000;
    const stopDuration = 350;
    const spin = icon.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
      duration,
      iterations: Infinity,
      easing: 'linear',
    });

    activeAnimation.current = spin;
    setSpinning(true);
    try {
      await refresh();
    } finally {
      if (activeAnimation.current !== spin) {
        return;
      }

      const currentAngle = ((Number(spin.currentTime ?? 0) % duration) / duration) * 360;
      const stop = icon.animate([{ transform: `rotate(${currentAngle}deg)` }, { transform: 'rotate(360deg)' }], {
        duration: stopDuration,
        easing: 'cubic-bezier(0.333333, 0.666667, 0.666667, 1)',
        fill: 'forwards',
      });

      spin.cancel();
      activeAnimation.current = stop;
      await stop.finished.then(
        () => {
          icon.style.transform = 'rotate(0deg)';
          stop.cancel();
          activeAnimation.current = null;
          setSpinning(false);
        },
        () => undefined,
      );
    }
  }

  return (
    <aside
      aria-label={t('admin.application.subscriptions.flowEditor.nodes')}
      aria-busy={loading}
      className="bg-sidebar min-h-0 w-64 shrink-0 overflow-hidden border-r"
    >
      <ScrollArea className="h-full">
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-muted-foreground text-xs">{t('admin.application.subscriptions.flowEditor.nodes')}</h2>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="border-0"
                    aria-label={t('shared.refresh')}
                    aria-busy={spinning}
                    disabled={loading || spinning}
                    onClick={() => void handleRefresh()}
                  />
                }
              >
                <RotateCw ref={refreshIcon} aria-hidden="true" />
              </TooltipTrigger>
              <TooltipContent side="top">{t('shared.refresh')}</TooltipContent>
            </Tooltip>
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
        </div>
      </ScrollArea>
    </aside>
  );
}
