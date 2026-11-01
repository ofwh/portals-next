'use client';

import { ScanText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NodeContentProps } from '../../../types';
import { subscriptionFormatLabels } from '../model/definition';
import type { ParseConfig } from '../model/types';

export const ParseIcon = ScanText;

export function ParseContent({ node, mode }: NodeContentProps<ParseConfig>) {
  const t = useTranslations('workflowNodes.subscription');

  return (
    <div className="flex h-full min-w-0 flex-col justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-2">
        <ParseIcon className="size-4 shrink-0" />
        <span className="truncate font-medium">{mode === 'canvas' ? node.name : t('parse.name')}</span>
      </div>
      <p className="text-muted-foreground truncate text-xs">
        {t(`formats.${subscriptionFormatLabels[node.config.format]}`)}
      </p>
    </div>
  );
}
