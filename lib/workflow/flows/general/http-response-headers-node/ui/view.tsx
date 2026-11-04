'use client';

import { List } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NodeContentProps } from '@/lib/workflow/node/types';
import type { HttpResponseHeadersConfig } from '../model/types';

export const HttpResponseHeadersIcon = List;

export function HttpResponseHeadersContent({ node, mode }: NodeContentProps<HttpResponseHeadersConfig>) {
  const t = useTranslations('workflowNodes.common');

  return (
    <div className="flex h-full min-w-0 flex-col justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-2">
        <HttpResponseHeadersIcon className="size-4 shrink-0" />
        <span className="truncate font-medium">{mode === 'canvas' ? node.name : t('httpResponseHeaders.name')}</span>
      </div>
      <p className="text-muted-foreground truncate text-xs" title={node.config.url}>
        {node.config.url || t('http.urlPlaceholder')}
      </p>
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>{node.config.method}</span>
        <span>{t('shared.formats.json')}</span>
      </div>
    </div>
  );
}
