'use client';

import {
  Background,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useUpdateNodeInternals,
} from '@xyflow/react';
import type { Edge, NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  CircleCheck,
  CircleX,
  Info,
  LoaderCircle,
  Maximize,
  RectangleHorizontal,
  Square,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';
import { memo, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useWorkflowCanvas } from '@/hooks/use-workflow-canvas';
import type { WorkflowCanvasNode } from '@/lib/types/workflow-canvas';
import type { NodeRunState } from '@/lib/workflow/model';
import { NODE_TYPE_MIME } from '@/lib/workflow/model/canvas';
import { nodeViewRegistry } from '@/lib/workflow/nodes/client';
import { NodeConfig } from './node-config';
import { NodePreview } from './node-list';
import { NodeRunDetails } from './node-run-details';

const nodeStatusIcons = {
  pending: null,
  running: LoaderCircle,
  success: CircleCheck,
  failed: CircleX,
  cancelled: null,
  skipped: null,
};

const CanvasNode = memo(function CanvasNode({
  id,
  data,
  selected,
  isConnectable,
  width,
  height,
}: NodeProps<WorkflowCanvasNode>) {
  const t = useTranslations('admin.application.subscriptions.flowEditor');
  const updateNodeInternals = useUpdateNodeInternals();
  const [details, setDetails] = useState<NodeRunState | null>(null);
  const { instance, manifest, available, expanded, runState } = data;
  const Content = nodeViewRegistry.getNodeView(instance.type)?.display?.Content;
  const StatusIcon = runState ? nodeStatusIcons[runState.status] : null;
  const canViewDetails = runState?.status === 'success' || runState?.status === 'failed';
  const hasInput = Boolean(manifest?.input);
  const hasOutput = Boolean(manifest?.output);

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, hasInput, hasOutput, expanded, width, height, updateNodeInternals]);

  return (
    <div
      className={`group/workflow-node bg-background relative size-full rounded-md border ${StatusIcon ? 'pr-12' : ''} ${expanded ? 'shadow-sm' : 'hover:bg-accent'} ${selected ? 'border-primary ring-primary ring-2' : ''}`}
    >
      {runState && StatusIcon && (
        <div className="nodrag nopan absolute top-1/2 right-3 z-10 -translate-y-1/2">
          <span role="status" className="sr-only">
            {t(`nodeStatus.${runState.status}`)}
          </span>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={canViewDetails ? t('runDetails') : t(`nodeStatus.${runState.status}`)}
                  className={
                    runState.status === 'running'
                      ? 'text-primary rounded-full border-0 shadow-none'
                      : runState.status === 'failed'
                        ? 'text-destructive border-0 shadow-none'
                        : runState.status === 'success'
                          ? 'text-primary border-0 shadow-none'
                          : 'text-muted-foreground border-0 shadow-none'
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    if (canViewDetails) {
                      setDetails(runState);
                    }
                  }}
                  onDoubleClick={(event) => event.stopPropagation()}
                />
              }
            >
              <StatusIcon
                aria-hidden="true"
                className={
                  runState.status === 'running'
                    ? 'animate-spin'
                    : canViewDetails
                      ? 'group-focus-within/workflow-node:hidden group-hover/workflow-node:hidden'
                      : undefined
                }
              />
              {canViewDetails && (
                <Info
                  aria-hidden="true"
                  className="hidden group-focus-within/workflow-node:block group-hover/workflow-node:block"
                />
              )}
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs break-words">
              <p>{canViewDetails ? t('runDetails') : t(`nodeStatus.${runState.status}`)}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
      {available && expanded && Content ? (
        <Content node={instance} selected={selected} status={runState?.status} mode="canvas" />
      ) : available ? (
        <NodePreview type={instance.type} name={instance.name} />
      ) : (
        <div className="p-4">
          <p className="truncate font-medium">{instance.name}</p>
          <p className="text-destructive mt-2 text-xs">{t('nodeUnavailable')}</p>
        </div>
      )}
      {details && <NodeRunDetails name={instance.name} state={details} onClose={() => setDetails(null)} />}
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable && available}
          aria-label={t('inputPort', { name: instance.name })}
          style={{ width: 12, height: 12, background: 'var(--background)', border: '2px solid var(--primary)' }}
        />
      )}
      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable && available}
          aria-label={t('outputPort', { name: instance.name })}
          style={{ width: 12, height: 12, background: 'var(--background)', border: '2px solid var(--primary)' }}
        />
      )}
    </div>
  );
});

const nodeTypes = { workflow: CanvasNode };
const edgeOptions = { markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeWidth: 2 } };
const flowStyle: CSSProperties & Record<`--xy-${string}`, string> = {
  '--xy-background-color': 'var(--muted)',
  '--xy-edge-stroke': 'var(--muted-foreground)',
  '--xy-edge-stroke-selected': 'var(--primary)',
  '--xy-connectionline-stroke': 'var(--primary)',
  '--xy-attribution-background-color': 'var(--background)',
  '--xy-selection-background-color': 'color-mix(in oklab, var(--primary) 8%, transparent)',
  '--xy-selection-border': '1px solid var(--primary)',
};

function CanvasContent() {
  const t = useTranslations('admin.application.subscriptions.flowEditor');
  const canvas = useWorkflowCanvas();
  const { flow, saving } = canvas;

  if (!flow) {
    return null;
  }

  return (
    <div className="bg-background flex min-h-0 min-w-0 flex-1 flex-col" aria-label={t('canvas')}>
      <div className="relative min-h-0 flex-1">
        <div className="bg-background absolute top-4 right-4 z-10 flex items-center gap-1 rounded-md border p-1 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={saving}
            aria-label={t('zoomIn')}
            onClick={() => void canvas.reactFlow.zoomIn()}
          >
            <ZoomIn />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={saving}
            aria-label={t('zoomOut')}
            onClick={() => void canvas.reactFlow.zoomOut()}
          >
            <ZoomOut />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={saving}
            aria-label={t('fitView')}
            onClick={() => void canvas.reactFlow.fitView({ padding: 0.2 })}
          >
            <Maximize />
          </Button>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant={canvas.showNodeDetails ? 'secondary' : 'ghost'}
                  size="icon-sm"
                  aria-label={t(canvas.showNodeDetails ? 'hideNodeDetails' : 'showNodeDetails')}
                  aria-pressed={canvas.showNodeDetails}
                  disabled={saving}
                  onClick={() => canvas.setShowNodeDetails((value) => !value)}
                />
              }
            >
              {canvas.showNodeDetails ? <RectangleHorizontal /> : <Square />}
            </TooltipTrigger>
            <TooltipContent side="top">
              {t(canvas.showNodeDetails ? 'hideNodeDetails' : 'showNodeDetails')}
            </TooltipContent>
          </Tooltip>
        </div>

        <ReactFlow<WorkflowCanvasNode, Edge>
          nodes={canvas.nodes}
          edges={canvas.edges}
          nodeTypes={nodeTypes}
          onNodesChange={canvas.onNodesChange}
          onEdgesChange={canvas.onEdgesChange}
          onConnect={canvas.onConnect}
          isValidConnection={canvas.isValidConnection}
          viewport={flow.viewport ?? { x: 0, y: 0, zoom: 1 }}
          onViewportChange={canvas.onViewportChange}
          onNodeDoubleClick={(_event, node) => {
            if (node.data.available && !saving) {
              canvas.setEditingId(node.id);
            }
          }}
          onDragOver={(event) => {
            if (!saving && event.dataTransfer.types.includes(NODE_TYPE_MIME)) {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'copy';
            }
          }}
          onDrop={canvas.drop}
          nodesDraggable={!saving}
          nodesConnectable={!saving}
          elementsSelectable={!saving}
          edgesReconnectable={false}
          deleteKeyCode={saving ? null : ['Backspace', 'Delete']}
          panOnDrag={!saving}
          zoomOnScroll={!saving}
          zoomOnPinch={!saving}
          zoomOnDoubleClick={false}
          minZoom={0.1}
          maxZoom={3}
          defaultEdgeOptions={edgeOptions}
          style={flowStyle}
        >
          <Background color="var(--border)" gap={20} />
        </ReactFlow>
        {canvas.nodes.length === 0 && (
          <p className="text-muted-foreground pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center text-sm">
            {t('emptyCanvas')}
          </p>
        )}
      </div>
      <NodeConfig id={canvas.editingId} onClose={() => canvas.setEditingId(null)} />
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
}
