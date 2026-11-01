'use client';

import { Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NodeContentProps } from '../../../types';
import type { HttpRequestConfig } from '../model/types';

export const HttpRequestIcon = Globe;

export function HttpRequestContent({ node, mode }: NodeContentProps<HttpRequestConfig>) {
  const t = useTranslations('workflowNodes.common');

  return (
    <div className="flex h-full min-w-0 flex-col justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-2">
        <HttpRequestIcon className="size-4 shrink-0" />
        <span className="truncate font-medium">{mode === 'canvas' ? node.name : t('httpRequest.name')}</span>
      </div>
      <p className="text-muted-foreground truncate text-xs" title={node.config.url}>
        {node.config.url || t('httpRequest.urlPlaceholder')}
      </p>
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>{node.config.method}</span>
        <span>{t(node.config.outputFormat === 'JSON' ? 'shared.formats.json' : 'shared.formats.text')}</span>
      </div>
    </div>
  );
}
