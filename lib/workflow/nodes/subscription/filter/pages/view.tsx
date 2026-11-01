'use client';

import { Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NodeContentProps } from '../../../types';
import type { FilterConfig } from '../types';

export const FilterIcon = Filter;

export function FilterContent({ node, mode }: NodeContentProps<FilterConfig>) {
  const t = useTranslations('admin.application.subscriptions.flowEditor.subscriptionNodes.filter');

  return (
    <div className="flex h-full min-w-0 flex-col justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-2">
        <FilterIcon className="size-4 shrink-0" />
        <span className="truncate font-medium">{mode === 'canvas' ? node.name : t('name')}</span>
      </div>
      <p className="text-muted-foreground truncate text-xs">
        {t(node.config.exclude ? 'excludeSummary' : 'keepSummary', { count: node.config.protocols.length })}
      </p>
    </div>
  );
}
