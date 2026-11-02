'use client';

import { ScanText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NodeContentProps } from '@/lib/workflow/nodes/types';
import { subscriptionFormatLabels } from '../model/definition';
import type { ExtractNodesConfig } from '../model/types';

export const ExtractNodesIcon = ScanText;

export function ExtractNodesContent({ node, mode }: NodeContentProps<ExtractNodesConfig>) {
  const t = useTranslations('workflowNodes.subscription');

  return (
    <div className="flex h-full min-w-0 flex-col justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-2">
        <ExtractNodesIcon className="size-4 shrink-0" />
        <span className="truncate font-medium">{mode === 'canvas' ? node.name : t('extractNodes.name')}</span>
      </div>
      <p className="text-muted-foreground truncate text-xs">
        {t(`extractNodes.formats.${subscriptionFormatLabels[node.config.format]}`)}
      </p>
    </div>
  );
}
