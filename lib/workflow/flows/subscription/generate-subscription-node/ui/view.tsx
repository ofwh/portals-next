'use client';

import { FileOutput } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NodeContentProps } from '@/lib/workflow/node/types';
import { outputFormatLabels } from '../model/definition';
import type { GenerateSubscriptionConfig } from '../model/types';

export const GenerateSubscriptionIcon = FileOutput;

export function GenerateSubscriptionContent({ node, mode }: NodeContentProps<GenerateSubscriptionConfig>) {
  const t = useTranslations('workflowNodes.subscription.generateSubscription');

  return (
    <div className="flex h-full min-w-0 flex-col justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-2">
        <GenerateSubscriptionIcon className="size-4 shrink-0" />
        <span className="truncate font-medium">{mode === 'canvas' ? node.name : t('name')}</span>
      </div>
      <p className="text-muted-foreground truncate text-xs">{outputFormatLabels[node.config.format]}</p>
    </div>
  );
}
