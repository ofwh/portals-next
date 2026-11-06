'use client';

import { FileCode2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NodeContentProps } from '@/lib/workflow/node/types';
import { templateFormatLabels } from '../model/definition';
import type { ParseTemplateConfig } from '../model/types';

export const ParseTemplateIcon = FileCode2;

export function ParseTemplateContent({ node, mode }: NodeContentProps<ParseTemplateConfig>) {
  const t = useTranslations('workflowNodes.subscription');

  return (
    <div className="flex h-full min-w-0 flex-col justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-2">
        <ParseTemplateIcon className="size-4 shrink-0" />
        <span className="truncate font-medium">{mode === 'canvas' ? node.name : t('parseTemplate.name')}</span>
      </div>
      <p className="text-muted-foreground truncate text-xs">{templateFormatLabels[node.config.format]}</p>
    </div>
  );
}
