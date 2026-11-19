'use client';

import { Route } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NodeContentProps } from '@/lib/workflow/node/types';
import type { RouteConfig } from '../model/types';

export const RouteIcon = Route;

export function RouteContent({ node, mode }: NodeContentProps<RouteConfig>) {
  const t = useTranslations();

  return (
    <div className="flex h-full min-w-0 flex-col justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-2">
        <RouteIcon className="size-4 shrink-0" />
        <span className="truncate font-medium">
          {mode === 'canvas' ? node.name : t('workflowNodes.proxy.route.name')}
        </span>
      </div>
      <p className="text-muted-foreground truncate text-xs" title={node.config.pathname}>
        {node.config.pathname || t('workflowNodes.proxy.route.pathname')}
      </p>
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>{node.config.method}</span>
        <span>{t(`admin.sidebar.${node.config.mode}`)}</span>
      </div>
    </div>
  );
}
